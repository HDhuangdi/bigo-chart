import Color from './Color.js'
import Constant from './Constant.js'
import { dateFormat, fixNumber } from './utils'

export default class View {
  service
  controller
  chart
  canvas
  ctx
  dpr
  logo
  // canvas内边距
  padding = {}
  // canvas高度
  canvasHeight
  // ccanvas宽度
  canvasWidth
  // 总图表宽度
  chartWidth
  // 总图表高度
  chartHeight
  // k线图表高度
  klineChartHeight
  // 交易量图表高度
  volumeChartHeight = 0
  // x轴显示的单位数 默认120分钟的数据
  xAxisUnitsVisiable = 1000 * 60 * 120
  // y轴显示的单位数 默认8个
  chartYAxisUnitsVisiable = 8
  // y轴显示的单位数 默认4个
  volumeYAxisUnitsVisiable = 4
  // 坐标轴轴标签字体大小
  axisLabelSize = 10
  // xy轴刻度线长度
  scaleHeight
  // 每根蜡烛的宽度
  candleWidth
  // 每根蜡烛的间距
  candleMargin

  inject (service, controller, chart) {
    this.service = service
    this.controller = controller
    this.chart = chart
  }

  // 创建元素
  createElements () {
    const { chart } = this

    chart.domUtils.setStyle(chart.container, { position: 'relative' })
    const box = chart.container.getBoundingClientRect()
    // canvas
    const height = box.height
    const width = box.width
    this.canvas = chart.domUtils.createElm('canvas', {
      id: Constant.CANVAS_ID,
      height,
      width
    })
    this.ctx = this.canvas.getContext('2d')
    chart.domUtils.appendElms(this.canvas)

    // candle info
    const candleInfo = chart.domUtils.createElm('div', {
      id: Constant.CANDLE_INFO_CONTAINER_ID
    })
    chart.domUtils.appendElms(candleInfo, chart.container)
    // time
    const timeSpan = chart.domUtils.createElm('span', {
      id: Constant.TIME_SPAN_ID
    })
    timeSpan.innerHTML = 'N/A'
    // open
    const openSpan = chart.domUtils.createElm('span', {
      id: Constant.OPEN_SPAN_ID
    })
    openSpan.innerHTML = 'O:'
    const openValue = chart.domUtils.createElm('span', {
      id: Constant.OPEN_VALUE_ID
    })
    openValue.innerHTML = 'N/A'
    // high
    const highSpan = chart.domUtils.createElm('span', {
      id: Constant.HIGH_SPAN_ID
    })
    highSpan.innerHTML = 'H:'
    const highValue = chart.domUtils.createElm('span', {
      id: Constant.HIGH_VALUE_ID
    })
    highValue.innerHTML = 'N/A'
    // low
    const lowSpan = chart.domUtils.createElm('span', {
      id: Constant.LOW_SPAN_ID
    })
    lowSpan.innerHTML = 'L:'
    const lowValue = chart.domUtils.createElm('span', {
      id: Constant.LOW_VALUE_ID
    })
    lowValue.innerHTML = 'N/A'
    // close
    const closeSpan = chart.domUtils.createElm('span', {
      id: Constant.CLOSE_SPAN_ID
    })
    closeSpan.innerHTML = 'C:'
    const closeValue = chart.domUtils.createElm('span', {
      id: Constant.CLOSE_VALUE_ID
    })
    closeValue.innerHTML = 'N/A'
    // change
    const changeSpan = chart.domUtils.createElm('span', {
      id: Constant.CHANGE_SPAN_ID
    })
    changeSpan.innerHTML = 'CHANGE:'
    const changeValue = chart.domUtils.createElm('span', {
      id: Constant.CHANGE_VALUE_ID
    })
    changeValue.innerHTML = 'N/A'
    // amplitude
    const amplitudeSpan = chart.domUtils.createElm('span', {
      id: Constant.AMPLITUDE_SPAN_ID
    })
    amplitudeSpan.innerHTML = 'AMPLITUDE:'
    const amplitudeValue = chart.domUtils.createElm('span', {
      id: Constant.AMPLITUDE_VALUE_ID
    })
    amplitudeValue.innerHTML = 'N/A'

    chart.domUtils.appendElms(
      [
        timeSpan,
        openSpan,
        openValue,
        highSpan,
        highValue,
        lowSpan,
        lowValue,
        closeSpan,
        closeValue,
        changeSpan,
        changeValue,
        amplitudeSpan,
        amplitudeValue
      ],
      candleInfo
    )

    // MA info
    const MAInfo = chart.domUtils.createElm('div', {
      id: Constant.MA_INFO_CONTAINER_ID
    })

    // MAs
    chart.MAOptions.forEach((option) => {
      const span = chart.domUtils.createElm('span')
      span.innerHTML = `MA(${option.interval}):`
      chart.domUtils.appendElms(span, MAInfo)

      const value = chart.domUtils.createElm('span', {
        id: `__ma-${option.interval}__`,
        style: `color:${option.color}`
      })
      value.innerHTML = 'N/A'
      chart.domUtils.appendElms(value, MAInfo)
    })
    chart.domUtils.appendElms(MAInfo, chart.container)

    if (!chart.options.hasVolume) return
    // vol
    const VolInfo = chart.domUtils.createElm('div', {
      id: Constant.VOL_INFO_CONTAINER_ID
    })
    chart.domUtils.appendElms(VolInfo, chart.container)
    const volSpan = chart.domUtils.createElm('span', {
      id: Constant.VOL_SPAN_ID
    })
    volSpan.innerHTML = `Vol(${chart.options.volumeSymbol}):`
    const volValue = chart.domUtils.createElm('span', {
      id: Constant.VOL_VALUE_ID
    })
    chart.domUtils.appendElms([volSpan, volValue], VolInfo)
  }

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
  }

  // 初始化图表
  initChart () {
    const { chart, controller } = this
    // logo
    const logoSrc = chart.options.logo
    if (logoSrc) {
      this.logo = new Image()
      this.logo.src = logoSrc
    }

    // 高清化
    this.highDefinition()
    // 事件注册
    controller.registerMouseEvents()

    this.draw()
  }

  // 计算图表宽高数据
  resize () {
    const { chart, service } = this

    service.calcPadding(chart.bars)

    this.chartHeight =
      this.canvasHeight - this.padding.top - this.padding.bottom
    this.chartWidth = this.canvasWidth - this.padding.left - this.padding.right

    if (chart.options.hasVolume) {
      this.volumeChartHeight = this.chartHeight / 3
    }
    this.klineChartHeight = this.chartHeight - this.volumeChartHeight

    const volInfo = chart.domUtils.getDOMElm(
      '#' + Constant.VOL_INFO_CONTAINER_ID
    )
    volInfo.style = `top:${
      (this.canvasHeight - this.volumeChartHeight) / this.dpr
    }px`
  }

  // 清空画布
  clearCanvas () {
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight
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

  // 绘制
  draw () {
    const { service, controller } = this
    this.resize()
    // 如果为用户控制dataZoom,就只需updte,否则就自动算dataZoom
    service.calcDataZoom(service.dataZoom.user ? 'update' : 'init')
    this.clearCanvas()
    this.drawBg()
    this.drawAxis()
    this.drawMAs()
    this.drawTicker()
    this.drawTickerInfo()
    this.drawLastTickerPrice()
    this.drawCursorCross(
      controller.nowMousePosition.x,
      controller.nowMousePosition.y
    )
  }

  // 绘制背景
  drawBg () {
    const chart = this.chart

    this.ctx.beginPath()
    this.ctx.fillStyle = chart.options.backgroundColor || '#191b20'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    if (!this.logo) return
    // 图片的特殊处理
    if (this.logo.complete) {
      this.drawLogo()
    } else {
      this.logo.onload = () => {
        this.drawLogo()
      }
    }
  }

  // 绘制坐标轴
  drawAxis () {
    const service = this.service

    // 计算单位
    service.calcUnitToXAxisPx()
    service.calcUnitToYAxisPx()
    this.drawXAxis()
    this.drawYAxis()
  }

  // 绘制x轴
  drawXAxis () {
    const service = this.service
    const chart = this.chart

    const xAxisPosition = service.calcXAxisCoordinate()
    this.scaleHeight = 5 * this.dpr

    // 轴线
    chart.canvasUtils.drawLine(
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
      chart.canvasUtils.drawLine(
        { x, y: this.chartHeight + this.padding.top },
        { x, y: this.chartHeight + this.padding.top + this.scaleHeight },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      chart.canvasUtils.drawLine(
        { x, y: this.padding.top },
        { x, y: this.chartHeight + this.padding.top },
        '#24272C'
      )

      this.drawLabels({ x, y: undefined }, data.time)
    }
  }

  // 绘制y轴
  drawYAxis () {
    const service = this.service
    const chart = this.chart

    // 绘制轴线
    chart.canvasUtils.drawLine(
      { x: this.padding.left + this.chartWidth, y: this.padding.top },
      {
        x: this.padding.left + this.chartWidth,
        y: this.chartHeight + this.padding.top
      },
      '#34383F'
    )

    const candleYAxisPosition = service.calcYAxisCoordinate('candle')
    candleYAxisPosition.forEach((data) => {
      // 绘制刻度线
      chart.canvasUtils.drawLine(
        { x: this.padding.left + this.chartWidth, y: data.y },
        {
          x: this.chartWidth + this.padding.top + this.scaleHeight,
          y: data.y
        },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      chart.canvasUtils.drawLine(
        { x: this.padding.left, y: data.y },
        { x: this.chartWidth + this.padding.left, y: data.y },
        '#24272C'
      )
      this.drawLabels({ x: undefined, y: data.y }, data.value)
    })

    if (!chart.options.hasVolume) return
    const volumeYAxisPosition = service.calcYAxisCoordinate('volume')
    volumeYAxisPosition.forEach((data) => {
      // 绘制刻度线
      chart.canvasUtils.drawLine(
        { x: this.padding.left + this.chartWidth, y: data.y },
        {
          x: this.chartWidth + this.padding.top + this.scaleHeight,
          y: data.y
        },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      chart.canvasUtils.drawLine(
        { x: this.padding.left, y: data.y },
        { x: this.chartWidth + this.padding.left, y: data.y },
        '#24272C'
      )
      this.drawLabels({ x: undefined, y: data.y }, data.value)
    })
  }

  // 绘制轴线标签
  drawLabels (potision, value) {
    const chart = this.chart

    let _value = value
    const textPos = { x: 0, y: 0 }
    if (potision.x) {
      // x轴处理
      _value = dateFormat('HH:MM', new Date(value))
      textPos.x = potision.x
      textPos.y = this.chartHeight + this.padding.top + this.scaleHeight
    } else {
      // y轴处理
      _value = fixNumber(_value, chart.priceDigitNumber)
      textPos.x =
        this.padding.left + this.chartWidth + this.scaleHeight + 2 * this.dpr
      textPos.y = potision.y
    }

    chart.canvasUtils.drawText(
      textPos.x,
      textPos.y,
      _value,
      this.axisLabelSize * this.dpr + 'px sans-serif',
      potision.x ? 'top' : 'middle',
      'rgb(132, 142, 156)',
      potision.x ? 'center' : 'left'
    )
  }

  // 绘制行情图
  drawTicker () {
    const { service, chart } = this

    service.dataZoom.realData.forEach((ticker) => {
      this.drawCandle(ticker)
      if (chart.options.hasVolume) {
        this.drawVolume(ticker)
      }
    })
  }

  // 绘制单根蜡烛
  drawCandle (ticker) {
    const service = this.service
    const chart = this.chart

    // 格式化行情数据
    service.formatTickerData(ticker)

    const status = ticker.status

    const openPosition = service.mapDataToCoordinate(ticker.time, ticker.open)
    const closePosition = service.mapDataToCoordinate(ticker.time, ticker.close)
    const highPosition = service.mapDataToCoordinate(ticker.time, ticker.high)
    const lowPosition = service.mapDataToCoordinate(ticker.time, ticker.low)
    this.candleMargin = chart.tickerUnit / 20 / service.unitToXAxisPx // 蜡烛间距为 1/20 k线单位所对应的宽度
    this.candleWidth =
      chart.tickerUnit / service.unitToXAxisPx - 2 * this.candleMargin

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
      chart.canvasUtils.drawLine(
        { x: openPosition.x, y: highPosition.y },
        { x: openPosition.x, y: lowPosition.y },
        Color[status]
      )
    }

    // 绘制蜡烛矩形部分
    chart.canvasUtils.drawRect(x, y, width, height, Color[status])
  }

  // 绘制交易量
  drawVolumes () {
    const { service } = this
    service.dataZoom.realData.forEach((ticker) => this.drawVolume(ticker))
  }

  // 绘制某个行情的交易量
  drawVolume (ticker) {
    const { service, chart } = this

    const { x, y } = service.mapDataToCoordinate(
      ticker.time,
      ticker.volume,
      'volume'
    )

    let volumeWidth = this.candleWidth
    const volumeHeight = this.canvasHeight - this.padding.bottom - y

    let rectX = x - volumeWidth / 2

    // 超出右边界的蜡烛的width处理
    if (rectX + volumeWidth >= this.padding.left + this.chartWidth) {
      volumeWidth =
        volumeWidth -
        (rectX + volumeWidth - this.padding.left - this.chartWidth) -
        2 * this.dpr /** 为了显示效果更加美观,2px 空余空间 */
      if (volumeWidth < 0) {
        volumeWidth = 0
      }
    } else if (rectX < this.padding.left) {
      // 超出左边界的蜡烛的width处理
      if (rectX + volumeWidth < this.padding.left) return
      volumeWidth = volumeWidth - (this.padding.left - rectX)
      rectX = this.padding.left
    }

    chart.canvasUtils.drawRect(
      rectX,
      y,
      volumeWidth,
      volumeHeight,
      Color[ticker.status + 'Lowlight']
    )
  }

  // 绘制MA线
  drawMAs () {
    const service = this.service
    const chart = this.chart
    service.calcMAPoints()
    chart.MAOptions.forEach((option) => {
      const MAPoints = option.points
      const MAPointsPositions = MAPoints.map((point) =>
        service.mapDataToCoordinate(point.time, point.value)
      )

      this.ctx.beginPath()
      for (let index = 0; index < MAPointsPositions.length; index++) {
        const point = MAPointsPositions[index]
        const nextPoint = MAPointsPositions[index + 1]
        if (!nextPoint) {
          break
        }
        // 横向边界处理
        if (
          point.x <= this.padding.left ||
          nextPoint.x >= this.chartWidth + this.padding.left
        ) {
          continue
        }
        // 纵向边界处理
        if (
          point.y > this.padding.top + this.klineChartHeight ||
          nextPoint.y > this.padding.top + this.klineChartHeight
        ) {
          continue
        }
        chart.canvasUtils.drawLine(
          { x: point.x, y: point.y },
          { x: nextPoint.x, y: nextPoint.y },
          option.color,
          false
        )
      }
      this.ctx.stroke()
    })
  }

  // 绘制当前行情信息
  drawTickerInfo () {
    const { chart } = this
    const currKline = chart.cursorTicker || chart.bars[chart.bars.length - 1]
    this.drawCandleInfo(currKline)
    const MAInfo = {}
    for (const option of chart.MAOptions) {
      MAInfo[option.interval] = option.points.find(
        (point) => point.time === currKline.time
      )
      if (!MAInfo[option.interval]) return
      MAInfo[option.interval].color = option.color
    }

    this.drawMAInfo(MAInfo)

    if (chart.options.hasVolume) {
      this.drawVolumeInfo(currKline)
    }
  }

  // 绘制蜡烛信息
  drawCandleInfo (info) {
    const { chart } = this
    const { domUtils } = chart

    // time
    const timeSpan = chart.domUtils.getDOMElm('#' + Constant.TIME_SPAN_ID)
    timeSpan.innerHTML = dateFormat('YYYY/mm/dd HH:MM', new Date(info.time))
    // open
    const openValue = chart.domUtils.getDOMElm('#' + Constant.OPEN_VALUE_ID)
    openValue.innerHTML = fixNumber(info.open, chart.priceDigitNumber)
    domUtils.setStyle(openValue, { color: Color[info.status] })
    // low
    const lowValue = chart.domUtils.getDOMElm('#' + Constant.LOW_VALUE_ID)
    lowValue.innerHTML = fixNumber(info.low, chart.priceDigitNumber)
    domUtils.setStyle(lowValue, { color: Color[info.status] })
    // close
    const closeValue = chart.domUtils.getDOMElm('#' + Constant.CLOSE_VALUE_ID)
    closeValue.innerHTML = fixNumber(info.close, chart.priceDigitNumber)
    domUtils.setStyle(closeValue, { color: Color[info.status] })
    // change
    const changeValue = chart.domUtils.getDOMElm('#' + Constant.CHANGE_VALUE_ID)
    changeValue.innerHTML = fixNumber(info.change, 2)
    domUtils.setStyle(changeValue, { color: Color[info.status] })
    // amplitude
    const amplitudeValue = chart.domUtils.getDOMElm(
      '#' + Constant.AMPLITUDE_VALUE_ID
    )
    amplitudeValue.innerHTML = fixNumber(info.amplitude, 2)
    domUtils.setStyle(amplitudeValue, { color: Color[info.status] })
  }

  // 绘制MA信息
  drawMAInfo (info) {
    const { chart } = this
    const { domUtils } = chart

    for (const key in info) {
      const data = info[key]
      const valueSpan = chart.domUtils.getDOMElm(`#__ma-${key}__`)
      valueSpan.innerHTML = fixNumber(data.value, chart.priceDigitNumber)
      domUtils.setStyle(valueSpan, { color: data.color })
    }
  }

  // 绘制交易量信息
  drawVolumeInfo (info) {
    const { chart } = this
    const { domUtils } = chart

    const valueSpan = chart.domUtils.getDOMElm(`#${Constant.VOL_VALUE_ID}`)
    valueSpan.innerHTML = fixNumber(info.volume, chart.volumeDigitNumer)
    domUtils.setStyle(valueSpan, { color: Color[info.status] })
  }

  // 绘制鼠标十字线
  drawCursorCross (cursorX, cursorY) {
    if (!cursorX || !cursorY) return
    const chart = this.chart

    let x = this.dpr * cursorX
    const y = this.dpr * cursorY

    // 边界情况
    if (
      x >= this.padding.left + this.chartWidth ||
      y > this.padding.top + this.chartHeight
    ) {
      this.canvas.style.cursor = 'default'
      return
    }
    this.canvas.style.cursor = 'crosshair'

    x = this.drawCursorLabel(x, y)

    // 横向
    chart.canvasUtils.drawLine(
      { x: this.padding.left, y },
      { x: this.padding.left + this.chartWidth, y },
      '#AEB4BC',
      true,
      [5 * this.dpr, 5 * this.dpr]
    )
    // 纵向
    chart.canvasUtils.drawLine(
      { x, y: this.padding.top },
      { x, y: this.padding.top + this.chartHeight },
      '#AEB4BC',
      true,
      [5 * this.dpr, 5 * this.dpr]
    )
  }

  // 绘制鼠标的xy轴标签
  drawCursorLabel (x, y) {
    const chart = this.chart
    const service = this.service
    const { ticker, type, value } = service.findTicker(x, y)

    chart.cursorTicker = ticker
    if (!ticker) {
      return x
    }

    // x轴标签绘制
    // 横坐标强制锁定寻找到的k线的中间部分
    const res = service.mapDataToCoordinate(ticker.time, 0)

    const formatedTime = dateFormat('YYYY/mm/dd HH:MM', new Date(ticker.time))
    // 绘制x轴矩形
    const { width: textWidth, height: textHeight } =
      chart.canvasUtils.getTextWidthAndHeight(
        this.axisLabelSize * this.dpr,
        'sans-serif',
        formatedTime
      )
    const reactWidth = textWidth + 15 * this.dpr
    const xReactHeight = this.padding.bottom
    chart.canvasUtils.drawRect(
      res.x - reactWidth / 2,
      this.chartHeight + this.padding.top,
      reactWidth,
      xReactHeight,
      '#2B2F36'
    )

    chart.canvasUtils.drawText(
      res.x,
      this.chartHeight + this.padding.top + xReactHeight / 2 - textHeight / 2,
      formatedTime,
      this.axisLabelSize * this.dpr + 'px sans-serif',
      'top',
      '#fff',
      'center'
    )

    // 绘制y轴多边形及文字
    this.drawYAxisLabelPolygon(y, '#2B2F36', '#3D434C', value, type)

    return res.x
  }

  // 绘制y轴多边形及文字
  drawYAxisLabelPolygon (y, fillStyle, strokeStyle, text, type) {
    const chart = this.chart

    const yReactHeight = 20 * this.dpr
    const yReactWidth = this.padding.right
    // y轴标签外面的箭头形状所对应的坐标
    const points = [
      {
        x: this.padding.left + this.chartWidth,
        y
      },
      {
        x: this.padding.left + this.chartWidth + yReactWidth / 6,
        y: y - yReactHeight / 2
      },
      {
        x: this.padding.left + this.chartWidth + yReactWidth,
        y: y - yReactHeight / 2
      },
      {
        x: this.padding.left + this.chartWidth + yReactWidth,
        y: y + yReactHeight / 2
      },
      {
        x: this.padding.left + this.chartWidth + yReactWidth / 6,
        y: y + yReactHeight / 2
      }
    ]
    const _text =
      type === 'price' ? fixNumber(text, chart.priceDigitNumber) : text
    const { width: textWidth } = chart.canvasUtils.getTextWidthAndHeight(
      this.axisLabelSize * this.dpr,
      'sans-serif',
      _text
    )

    chart.canvasUtils.drawPolygon(points, 'fill', fillStyle, 1 * this.dpr)
    chart.canvasUtils.drawPolygon(points, 'stroke', strokeStyle, 1 * this.dpr)

    chart.canvasUtils.drawText(
      this.padding.left +
        this.chartWidth +
        this.scaleHeight +
        this.padding.right / 2 -
        textWidth / 2,
      y,
      _text,
      12 * this.dpr + 'px ',
      'middle',
      '#fff',
      'left'
    )
  }

  // 在y轴高亮屏幕中最后一根行情的实时价
  drawLastTickerPrice () {
    const service = this.service
    const lastCandle = service.dataZoom.data[service.dataZoom.data.length - 1]
    const { y } = service.mapDataToCoordinate(lastCandle.time, lastCandle.close)
    this.drawYAxisLabelPolygon(
      y,
      Color[lastCandle.status],
      lastCandle.status === 'up' ? Color.upHighlight : Color.downHighlight,
      lastCandle.close,
      'price'
    )
  }
}
