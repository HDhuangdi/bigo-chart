import canvasUtils, { dateFormat, getAVG } from './utils.js'
import logo from './logo.png'

export default class QuoteChart {
  options
  bars
  canvas
  ctx
  dpr
  logo
  canvasUtils
  // k线单位,一根k线为多少时间
  klineUnit
  // canvas内边距
  padding = {}
  // canvas高度
  canvasHeight
  // canvas宽度
  canvasWidth
  // 图表高度
  chartHeight
  // 图表宽度
  chartWidth
  // 图表超出右边界的量,单位px
  rightSideOffset = 0
  // x轴显示的单位数 默认120分钟的数据
  xAxisUnitsVisiable = 1000 * 60 * 120
  // 1px 为多少x轴单位
  unitToXAxisPx = 0
  // y轴显示的单位数 默认8个
  yAxisUnitsVisiable = 8
  // y轴缓冲系数
  yAxisBuffer = 0.1
  // 1px 为多少y轴单位
  unitToYAxisPx = 0
  // 坐标轴轴标签字体大小
  axisLabelSize = 10
  // 缩放对象
  dataZoom = {}
  // 每根蜡烛的宽度
  candleWidth
  // 每根蜡烛的间距
  candleMargin
  // 当前鼠标是否按下
  isMouseDown = false
  // 上一次移动时鼠标的定位
  prevMousePosition = {}
  // 移动中的鼠标定位
  nowMousePosition = {}
  // 拖动系数
  dragCoefficient = 1000
  // 数据精度
  digitNumber = 2
  // MA list
  MAOptions = [
    {
      color: 'rgb(255, 109, 0)',
      interval: 5
    },
    {
      color: 'rgb(38, 198, 218)',
      interval: 10
    },
    {
      color: 'rgb(251, 192, 45)',
      interval: 30
    }
  ]

  constructor (options) {
    this.options = options
    this.logo = new Image()
    this.logo.src = options.logo || logo
    if (options.MA) {
      this.MAOptions = options.MA
    }
    this.bars = options.bars
    this.klineUnit = this.bars[1].time - this.bars[0].time
    this.canvas = document.querySelector(options.el)
    this.highDefinition()
    this.canvasUtils = canvasUtils(this.ctx)
    this.calcPadding(this.bars)
    this.calcMAPoints()
    this.registerMouseEvents()
    this.calcDataZoom('init')
    this.draw()
  }

  /** ************** Services ****************/

  // 计算1像素等于多少x轴单位
  calcUnitToXAxisPx () {
    this.unitToXAxisPx = this.xAxisUnitsVisiable / this.chartWidth
  }

  // 计算1像素等于多少y轴单位
  calcUnitToYAxisPx () {
    // 根据chartHeight和y轴范围算出1px为多少y轴单位
    this.unitToYAxisPx =
      (this.dataZoom.yAxisEndValue - this.dataZoom.yAxisStartValue) /
      this.chartHeight
  }

  // 计算x轴所有标签的坐标
  calcXAxisCoordinate () {
    // 每隔count个画一个刻度
    const count = 15

    const xAxisData = []
    for (let index = 0; index < this.bars.length; index += count) {
      xAxisData.push({
        time: this.bars[index].time,
        value: 0
      })
    }

    const xAxisPosition = xAxisData.map((data) => {
      const res = this.mapCoordinate(data.time, data.value)
      return {
        x: res.x,
        y: 0,
        time: data.time
      }
    })
    return xAxisPosition
  }

  // 计算y轴所有标签的坐标
  calcYAxisCoordinate () {
    const intervalValue =
      (this.dataZoom.yAxisEndValue - this.dataZoom.yAxisStartValue) /
      (this.yAxisUnitsVisiable - 1)
    const yAxisData = []
    for (let index = 0; index < this.yAxisUnitsVisiable; index++) {
      const res = this.mapCoordinate(
        0,
        this.dataZoom.yAxisStartValue + index * intervalValue
      )
      yAxisData.push({
        x: this.padding.left + this.chartWidth,
        y: res.y,
        value: this.dataZoom.yAxisStartValue + index * intervalValue
      })
    }
    return yAxisData
  }

  // 计算chart padding
  calcPadding (data) {
    const textWidth = this.canvasUtils.getTextWidth(
      this.axisLabelSize * this.dpr + 'px sans-serif',
      Math.max(...data.map((item) => item.high))
    )
    this.padding.top = 15 * this.dpr
    this.padding.bottom = 20 * this.dpr
    this.padding.left = 15 * this.dpr

    this.padding.right = textWidth + 10 * this.dpr /** 为了美观 10px 冗余 */
    this.chartHeight =
      this.canvasHeight - this.padding.top - this.padding.bottom
    this.chartWidth = this.canvasWidth - this.padding.left - this.padding.right
  }

  // 初始化缩放对象
  calcDataZoom (type = 'update') {
    if (type === 'init') {
      // x
      this.dataZoom.xAxisEndValue =
        this.bars[this.bars.length - 1].time +
        3 * this.klineUnit -
        this.rightSideOffset * this.unitToXAxisPx
      this.dataZoom.xAxisStartValue =
        this.dataZoom.xAxisEndValue - this.xAxisUnitsVisiable
    } else if (type === 'update') {
      this.xAxisUnitsVisiable =
        this.dataZoom.xAxisEndValue - this.dataZoom.xAxisStartValue
    }

    // data  前后多拿一个
    this.dataZoom.data = this.bars.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue + this.klineUnit &&
        bar.time >= this.dataZoom.xAxisStartValue - this.klineUnit
    )

    // y
    const sortedData = Array.prototype
      .concat([], this.dataZoom.data)
      .sort((a, b) => b.high - a.high)
    // y轴最高的数据
    const highest = sortedData[0].high
    sortedData.sort((a, b) => a.low - b.low)
    // y轴最低的数据
    const lowest = sortedData[0].low
    // 缓冲系数
    this.yAxisBuffer = 0.1

    this.dataZoom.yAxisEndValue =
      highest + (highest - lowest) * this.yAxisBuffer
    this.dataZoom.yAxisStartValue =
      lowest - (highest - lowest) * this.yAxisBuffer
  }

  // 计算MA points
  calcMAPoints () {
    this.MAOptions.forEach(({ interval }, index, arr) => {
      const MAPoints = []
      const reduce = []
      for (let index = 0; index < this.bars.length; index++) {
        const point = {
          value: this.bars[index].close,
          time: this.bars[index].time
        }

        reduce.push(point)
        if (index >= interval - 1) {
          MAPoints.push({
            value:
              getAVG(reduce.map((item) => item.value)).toFixed(
                this.digitNumber
              ) * 1,
            time: point.time
          })
          reduce.shift()
        }
      }
      arr[index].points = MAPoints
    })
  }

  // 数据 => 坐标 映射
  mapCoordinate (time, value) {
    const position = {
      x: 0,
      y: 0
    }

    position.x =
      this.padding.left +
      ((time - this.dataZoom.xAxisStartValue) / this.unitToXAxisPx).toFixed(1) *
        1

    const height =
      ((value - this.dataZoom.yAxisStartValue) / this.unitToYAxisPx).toFixed(
        1
      ) * 1

    position.y = this.padding.top + this.chartHeight - height

    return position
  }

  /** ************** View ****************/
  // 高清化
  highDefinition () {
    this.dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()

    this.canvas.width = rect.width * this.dpr
    this.canvas.height = rect.height * this.dpr
    this.canvasWidth = this.canvas.width
    this.canvasHeight = this.canvas.height
    this.canvas.style.height = this.canvas.height / this.dpr + 'px'
    this.canvas.style.width = this.canvas.width / this.dpr + 'px'

    this.ctx = this.canvas.getContext('2d')
  }

  // 绘制logo
  drawLogo () {
    const logoWidth = 464 * 0.75 * this.dpr
    const logoHeight = 114 * 0.75 * this.dpr
    this.ctx.drawImage(
      this.logo,
      this.canvasWidth / 2 - logoWidth / 2,
      this.canvasHeight / 2 - logoHeight / 2,
      logoWidth,
      logoHeight
    )
  }

  // 清空画布
  clearCanvas () {
    this.canvas.height = this.canvasHeight
    this.canvas.width = this.canvasWidth
  }

  // 绘图
  draw () {
    this.calcDataZoom('update')
    this.clearCanvas()
    // 图片的特殊处理
    if (this.logo.complete) {
      this.drawLogo()
    } else {
      this.logo.onload = () => {
        this.drawLogo()
      }
    }
    this.drawAxis()
    this.drawMAs()
    this.drawCandles()
  }

  // 绘制坐标轴
  drawAxis () {
    // 计算单位
    this.calcUnitToXAxisPx()
    this.calcUnitToYAxisPx()
    this.drawXAxis()
    this.drawYAxis()
  }

  // 绘制x轴
  drawXAxis () {
    const xAxisPosition = this.calcXAxisCoordinate()
    const scaleHeight = 5 * this.dpr

    // 轴线
    this.canvasUtils.drawLine(
      { x: this.padding.left, y: this.chartHeight + this.padding.top },
      {
        x: this.chartWidth + this.padding.left,
        y: this.chartHeight + this.padding.top
      },
      '#34383F'
    )

    for (const data of xAxisPosition) {
      const x = data.x
      // 超出左右边界不处理
      if (x >= this.padding.left + this.chartWidth || x <= this.padding.left) {
        continue
      }

      // 绘制刻度线
      this.canvasUtils.drawLine(
        { x, y: this.chartHeight + this.padding.top },
        { x, y: this.chartHeight + this.padding.top + scaleHeight },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      this.canvasUtils.drawLine(
        { x, y: this.padding.top },
        { x, y: this.chartHeight + this.padding.top },
        '#24272C'
      )

      this.drawLabels({ x, y: undefined }, scaleHeight, data.time)
    }
  }

  // 绘制y轴
  drawYAxis () {
    const yAxisPosition = this.calcYAxisCoordinate()
    const scaleHeight = 5 * this.dpr

    this.canvasUtils.drawLine(
      { x: this.padding.left + this.chartWidth, y: this.padding.top },
      {
        x: this.padding.left + this.chartWidth,
        y: this.chartHeight + this.padding.top
      },
      '#34383F'
    )
    yAxisPosition.forEach((data) => {
      // 绘制刻度线
      this.canvasUtils.drawLine(
        { x: this.padding.left + this.chartWidth, y: data.y },
        { x: this.chartWidth + this.padding.top + scaleHeight, y: data.y },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      this.canvasUtils.drawLine(
        { x: this.padding.left, y: data.y },
        { x: this.chartWidth + this.padding.left, y: data.y },
        '#24272C'
      )
      this.drawLabels({ x: undefined, y: data.y }, scaleHeight, data.value)
    })
  }

  // 绘制轴线标签
  drawLabels (potision, scaleHeight, value) {
    let _value = value
    if (potision.x) {
      // x轴处理
      _value = dateFormat('HH:MM', new Date(value))
    } else {
      // y轴处理
      _value = _value.toFixed(this.digitNumber)
    }

    this.canvasUtils.drawText(
      potision.x || this.padding.left + this.chartWidth + scaleHeight,
      potision.y || this.chartHeight + this.padding.top + scaleHeight,
      _value,
      this.axisLabelSize * this.dpr + 'px sans-serif',
      potision.x ? 'top' : 'middle',
      'rgb(132, 142, 156)',
      potision.x ? 'center' : 'left'
    )
  }

  // 绘制蜡烛图
  drawCandles () {
    this.dataZoom.data.forEach((candleData, index) =>
      this.drawCandle(candleData, index)
    )
  }

  // 绘制单根蜡烛
  drawCandle (candleData, index) {
    const openPosition = this.mapCoordinate(candleData.time, candleData.open)
    const closePosition = this.mapCoordinate(candleData.time, candleData.close)
    const highPosition = this.mapCoordinate(candleData.time, candleData.high)
    const lowPosition = this.mapCoordinate(candleData.time, candleData.low)
    this.candleMargin = 5000 / this.unitToXAxisPx // 蜡烛间距为 5 秒的宽度
    this.candleWidth = 60000 / this.unitToXAxisPx - 2 * this.candleMargin

    const status = candleData.close >= candleData.open ? 'up' : 'down'
    let x =
      status === 'up'
        ? closePosition.x - this.candleWidth / 2
        : openPosition.x - this.candleWidth / 2
    const y = status === 'up' ? closePosition.y : openPosition.y
    const height = Math.abs(closePosition.y - openPosition.y)
    let width = this.candleWidth

    // 超出右边界的蜡烛的width处理
    if (x + width >= this.padding.left + this.chartWidth) {
      width =
        width -
        (x + width - this.padding.left - this.chartWidth) -
        2 * this.dpr /** 为了显示效果更加美观,2px 空余空间 */
      if (width < 0) {
        width = 0
      }
    } else if (x < this.padding.left) {
      // 超出左边界的蜡烛的width处理
      if (x + width < this.padding.left) return
      width = width - (this.padding.left - x)
      x = this.padding.left
    } else {
      // 绘制烛芯部分
      this.canvasUtils.drawLine(
        { x: openPosition.x, y: highPosition.y },
        { x: openPosition.x, y: lowPosition.y },
        status === 'up' ? '#04BD75' : '#CF304A'
      )
    }

    // 绘制蜡烛矩形部分
    this.canvasUtils.drawRect(
      x,
      y,
      width,
      height,
      status === 'up' ? '#04BD75' : '#CF304A'
    )
  }

  // 绘制MA线
  drawMAs () {
    this.MAOptions.forEach((option) => {
      const MAPoints = option.points
      const MAPointsPositions = MAPoints.map((point) =>
        this.mapCoordinate(point.time, point.value)
      )
      this.ctx.beginPath()
      for (let index = 0; index < MAPointsPositions.length; index++) {
        const point = MAPointsPositions[index]
        const nextPoint = MAPointsPositions[index + 1]
        if (!nextPoint) {
          break
        }
        // 边界处理
        if (
          point.x <= this.padding.left ||
          nextPoint.x >= this.chartWidth + this.padding.left
        ) {
          continue
        }

        this.canvasUtils.drawLine(
          { x: point.x, y: point.y },
          { x: nextPoint.x, y: nextPoint.y },
          option.color,
          false
        )
      }
      this.ctx.stroke()
    })
  }

  /** ************** Controller ****************/

  // 注册事件
  registerMouseEvents () {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('mousewheel', this.onMouseWeel.bind(this))
  }

  // 鼠标点击事件
  onMouseDown (e) {
    this.isMouseDown = true
    this.prevMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  // 鼠标移动事件
  onMouseMove (e) {
    if (!this.isMouseDown) return
    this.nowMousePosition = { x: e.offsetX, y: e.offsetY }
    const diffX = this.prevMousePosition.x - this.nowMousePosition.x
    const lastCandleTime = this.bars[this.bars.length - 1].time
    const firstCandleTime = this.bars[0].time
    const newDataZoomXAxisStartValue =
      this.dataZoom.xAxisStartValue + this.dragCoefficient * diffX
    const newDataZoomXAxisEndValue =
      this.dataZoom.xAxisEndValue + this.dragCoefficient * diffX

    // 更新拖动系数
    this.dragCoefficient = (this.xAxisUnitsVisiable / this.klineUnit) * 40
    // 边界处理  分页  4个K线单位冗余
    if (newDataZoomXAxisStartValue + 20 * this.klineUnit >= lastCandleTime) {
      return
    }
    if (newDataZoomXAxisEndValue - 20 * this.klineUnit <= firstCandleTime) {
      // 分页
      return
    }

    this.dataZoom.xAxisStartValue = newDataZoomXAxisStartValue
    this.dataZoom.xAxisEndValue = newDataZoomXAxisEndValue

    this.draw()
    this.prevMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  // 鼠标抬起事件
  onMouseUp (e) {
    this.isMouseDown = false
    this.prevMousePosition = {}
    this.nowMousePosition = {}
  }

  // 滚轮事件
  onMouseWeel (e) {
    let delta
    if (e.wheelDelta) {
      // IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
      delta = e.wheelDelta / 120
      if (window.opera) delta = -delta // 因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
    } else if (e.detail) {
      // FF浏览器使用的是detail,其值为“正负3”
      delta = -e.detail / 3
    }
    if (delta >= 0) {
      if (this.dataZoom.data.length <= 20) return
      // 放大
      this.dataZoom.xAxisStartValue = this.dataZoom.xAxisStartValue + 1000 * 120
      this.dataZoom.xAxisEndValue = this.dataZoom.xAxisEndValue - 1000 * 120
    } else {
      if (this.dataZoom.data.length >= 200) return
      // 缩小
      this.dataZoom.xAxisStartValue = this.dataZoom.xAxisStartValue - 1000 * 120
      this.dataZoom.xAxisEndValue = this.dataZoom.xAxisEndValue + 1000 * 120
    }
    this.calcDataZoom()
    this.draw()
  }

  // 订阅数据
  subscribeBars (value, time) {
    // 1621092420000
    const lastCandle = this.bars[this.bars.length - 1]

    const candleTpUpdate = {
      close: lastCandle.close,
      high: lastCandle.high,
      low: lastCandle.low,
      open: lastCandle.open,
      time: lastCandle.time
    }
    if (time - lastCandle.time >= this.klineUnit) {
      // new
      candleTpUpdate.close = value
      candleTpUpdate.open = lastCandle.close
      candleTpUpdate.high = value
      candleTpUpdate.low = value
      candleTpUpdate.time = time
      this.bars.push(candleTpUpdate)
    } else {
      // update
      candleTpUpdate.close = value
      candleTpUpdate.time = time
      this.bars[this.bars.length - 1] = candleTpUpdate
    }

    this.draw()
  }
}
