import { dateFormat } from './utils.js'

export default class View {
  service
  controller
  chart

  inject (service, controller, chart) {
    this.service = service
    this.controller = controller
    this.chart = chart
  }

  // 高清化
  highDefinition () {
    const chart = this.chart

    chart.dpr = window.devicePixelRatio || 1
    const rect = chart.canvas.getBoundingClientRect()

    chart.canvas.width = rect.width * chart.dpr
    chart.canvas.height = rect.height * chart.dpr
    chart.canvasWidth = chart.canvas.width
    chart.canvasHeight = chart.canvas.height
    chart.canvas.style.height = chart.canvas.height / chart.dpr + 'px'
    chart.canvas.style.width = chart.canvas.width / chart.dpr + 'px'
  }

  // 清空画布
  clearCanvas () {
    const chart = this.chart

    chart.canvas.height = chart.canvasHeight
    chart.canvas.width = chart.canvasWidth
  }

  // 绘制logo
  drawLogo () {
    const chart = this.chart

    const logoWidth = 464 * 0.75 * chart.dpr
    const logoHeight = 114 * 0.75 * chart.dpr
    chart.ctx.drawImage(
      chart.logo,
      chart.canvasWidth / 2 - logoWidth / 2,
      chart.canvasHeight / 2 - logoHeight / 2,
      logoWidth,
      logoHeight
    )
  }

  // 绘制
  draw () {
    const chart = this.chart
    const service = this.service

    // 如果为用户控制dataZoom,就只需updte,否则就自动算dataZoom
    service.calcDataZoom(chart.dataZoom.user ? 'update' : 'init')
    this.clearCanvas()
    // 图片的特殊处理
    if (chart.logo.complete) {
      this.drawLogo()
    } else {
      chart.logo.onload = () => {
        this.drawLogo()
      }
    }
    this.drawAxis()
    this.drawMAs()
    this.drawCandles()
    this.drawLastCandlePriceLine()
    this.drawCursorCross(chart.nowMousePosition.x, chart.nowMousePosition.y)
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
    chart.scaleHeight = 5 * chart.dpr

    // 轴线
    chart.canvasUtils.drawLine(
      { x: chart.padding.left, y: chart.chartHeight + chart.padding.top },
      {
        x: chart.chartWidth + chart.padding.left,
        y: chart.chartHeight + chart.padding.top
      },
      '#34383F'
    )

    for (const data of xAxisPosition) {
      const x = data.x
      // 超出左右边界不处理
      if (
        x >= chart.padding.left + chart.chartWidth ||
        x <= chart.padding.left
      ) {
        continue
      }

      // 绘制刻度线
      chart.canvasUtils.drawLine(
        { x, y: chart.chartHeight + chart.padding.top },
        { x, y: chart.chartHeight + chart.padding.top + chart.scaleHeight },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      chart.canvasUtils.drawLine(
        { x, y: chart.padding.top },
        { x, y: chart.chartHeight + chart.padding.top },
        '#24272C'
      )

      this.drawLabels({ x, y: undefined }, data.time)
    }
  }

  // 绘制y轴
  drawYAxis () {
    const service = this.service
    const chart = this.chart

    const yAxisPosition = service.calcYAxisCoordinate()

    chart.canvasUtils.drawLine(
      { x: chart.padding.left + chart.chartWidth, y: chart.padding.top },
      {
        x: chart.padding.left + chart.chartWidth,
        y: chart.chartHeight + chart.padding.top
      },
      '#34383F'
    )
    yAxisPosition.forEach((data) => {
      // 绘制刻度线
      chart.canvasUtils.drawLine(
        { x: chart.padding.left + chart.chartWidth, y: data.y },
        {
          x: chart.chartWidth + chart.padding.top + chart.scaleHeight,
          y: data.y
        },
        'rgb(132, 142, 156)'
      )
      // 绘制网格
      chart.canvasUtils.drawLine(
        { x: chart.padding.left, y: data.y },
        { x: chart.chartWidth + chart.padding.left, y: data.y },
        '#24272C'
      )
      this.drawLabels({ x: undefined, y: data.y }, data.value)
    })
  }

  // 绘制轴线标签
  drawLabels (potision, value) {
    const chart = this.chart

    let _value = value
    if (potision.x) {
      // x轴处理
      _value = dateFormat('HH:MM', new Date(value))
    } else {
      // y轴处理
      _value = _value.toFixed(chart.digitNumber)
    }

    chart.canvasUtils.drawText(
      potision.x || chart.padding.left + chart.chartWidth + chart.scaleHeight,
      potision.y || chart.chartHeight + chart.padding.top + chart.scaleHeight,
      _value,
      chart.axisLabelSize * chart.dpr + 'px sans-serif',
      potision.x ? 'top' : 'middle',
      'rgb(132, 142, 156)',
      potision.x ? 'center' : 'left'
    )
  }

  // 绘制蜡烛图
  drawCandles () {
    this.chart.dataZoom.data.forEach((candleData, index) => {
      this.drawCandle(candleData, index)
    })
  }

  // 绘制单根蜡烛
  drawCandle (candleData, index) {
    const service = this.service
    const chart = this.chart

    const openPosition = service.mapDataToCoordinate(
      candleData.time,
      candleData.open
    )
    const closePosition = service.mapDataToCoordinate(
      candleData.time,
      candleData.close
    )
    const highPosition = service.mapDataToCoordinate(
      candleData.time,
      candleData.high
    )
    const lowPosition = service.mapDataToCoordinate(
      candleData.time,
      candleData.low
    )
    chart.candleMargin = chart.klineUnit / 20 / chart.unitToXAxisPx // 蜡烛间距为 1/20 k线单位所对应的宽度
    chart.candleWidth =
      chart.klineUnit / chart.unitToXAxisPx - 2 * chart.candleMargin

    const status = candleData.close >= candleData.open ? 'up' : 'down'
    let x =
      status === 'up'
        ? closePosition.x - chart.candleWidth / 2
        : openPosition.x - chart.candleWidth / 2
    const y = status === 'up' ? closePosition.y : openPosition.y
    const height = Math.abs(closePosition.y - openPosition.y)
    let width = chart.candleWidth

    // 超出右边界的蜡烛的width处理
    if (x + width >= chart.padding.left + chart.chartWidth) {
      width =
        width -
        (x + width - chart.padding.left - chart.chartWidth) -
        2 * chart.dpr /** 为了显示效果更加美观,2px 空余空间 */
      if (width < 0) {
        width = 0
      }
    } else if (x < chart.padding.left) {
      // 超出左边界的蜡烛的width处理
      if (x + width < chart.padding.left) return
      width = width - (chart.padding.left - x)
      x = chart.padding.left
    } else {
      // 绘制烛芯部分
      chart.canvasUtils.drawLine(
        { x: openPosition.x, y: highPosition.y },
        { x: openPosition.x, y: lowPosition.y },
        status === 'up' ? '#04BD75' : '#CF304A'
      )
    }

    // 绘制蜡烛矩形部分
    chart.canvasUtils.drawRect(
      x,
      y,
      width,
      height,
      status === 'up' ? '#04BD75' : '#CF304A'
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

      chart.ctx.beginPath()
      for (let index = 0; index < MAPointsPositions.length; index++) {
        const point = MAPointsPositions[index]
        const nextPoint = MAPointsPositions[index + 1]
        if (!nextPoint) {
          break
        }
        // 边界处理
        if (
          point.x <= chart.padding.left ||
          nextPoint.x >= chart.chartWidth + chart.padding.left
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
      chart.ctx.stroke()
    })
  }

  // 绘制鼠标十字线
  drawCursorCross (cursorX, cursorY) {
    if (!cursorX || !cursorY) return
    const chart = this.chart

    let x = chart.dpr * cursorX
    const y = chart.dpr * cursorY

    // 边界情况
    if (
      x >= chart.padding.left + chart.chartWidth ||
      y >= chart.padding.top + chart.chartHeight
    ) {
      chart.canvas.style.cursor = 'default'
      return
    }
    chart.canvas.style.cursor = 'crosshair'

    x = this.drawCursorLabel(x, y)

    // 横向
    chart.canvasUtils.drawLine(
      { x: chart.padding.left, y },
      { x: chart.padding.left + chart.chartWidth, y },
      '#AEB4BC',
      true,
      [5 * chart.dpr, 5 * chart.dpr]
    )
    // 纵向
    chart.canvasUtils.drawLine(
      { x, y: chart.padding.top },
      { x, y: chart.padding.top + chart.chartHeight },
      '#AEB4BC',
      true,
      [5 * chart.dpr, 5 * chart.dpr]
    )
  }

  // 绘制鼠标的xy轴标签
  drawCursorLabel (x, y) {
    const chart = this.chart
    const service = this.service

    // 鼠标所指的坐标映射
    const { time: cursorTime, value } = service.mapCoordinateToData(
      x - chart.padding.left,
      y - chart.padding.top
    )

    // 寻找鼠标所指的k线
    const [candle] = chart.dataZoom.data.filter((data) => {
      return (
        data.time <= cursorTime && data.time + chart.klineUnit >= cursorTime
      )
    })
    if (!candle) {
      return x
    }

    // x轴标签绘制
    // 横坐标强制锁定寻找到的k线的中间部分
    const res = service.mapDataToCoordinate(candle.time, 0)

    const formatedTime = dateFormat('YYYY-mm-dd HH:MM', new Date(candle.time))
    // 绘制x轴矩形
    const { width: textWidth, height: textHeight } =
      chart.canvasUtils.getTextWidthAndHeight(
        chart.axisLabelSize * chart.dpr,
        'sans-serif',
        formatedTime
      )
    const reactWidth = textWidth + 15 * chart.dpr
    const xReactHeight = chart.padding.bottom
    chart.canvasUtils.drawRect(
      res.x - reactWidth / 2,
      chart.chartHeight + chart.padding.top,
      reactWidth,
      xReactHeight,
      '#2B2F36'
    )

    chart.canvasUtils.drawText(
      res.x,
      chart.chartHeight + chart.padding.top + xReactHeight / 2 - textHeight / 2,
      formatedTime,
      chart.axisLabelSize * chart.dpr + 'px sans-serif',
      'top',
      '#fff',
      'center'
    )

    // 绘制y轴多边形及文字
    this.drawYAxisLabelPolygon(y, '#2B2F36', '#3D434C', value)

    return res.x
  }

  // 绘制y轴多边形及文字
  drawYAxisLabelPolygon (y, fillStyle, strokeStyle, text) {
    const chart = this.chart

    const yReactHeight = 20 * chart.dpr
    const yReactWidth = chart.padding.right
    // y轴标签外面的箭头形状所对应的坐标
    const points = [
      {
        x: chart.padding.left + chart.chartWidth,
        y
      },
      {
        x: chart.padding.left + chart.chartWidth + yReactWidth / 6,
        y: y - yReactHeight / 2
      },
      {
        x: chart.padding.left + chart.chartWidth + yReactWidth,
        y: y - yReactHeight / 2
      },
      {
        x: chart.padding.left + chart.chartWidth + yReactWidth,
        y: y + yReactHeight / 2
      },
      {
        x: chart.padding.left + chart.chartWidth + yReactWidth / 6,
        y: y + yReactHeight / 2
      }
    ]
    chart.canvasUtils.drawPolygon(points, 'fill', fillStyle, 1 * chart.dpr)
    chart.canvasUtils.drawPolygon(points, 'stroke', strokeStyle, 1 * chart.dpr)
    chart.canvasUtils.drawText(
      chart.padding.left + chart.chartWidth + chart.scaleHeight,
      y,
      text,
      12 * chart.dpr + 'px ',
      'middle',
      '#fff',
      'left'
    )
  }

  // 绘制屏幕中最后一根k线的水平线
  drawLastCandlePriceLine () {
    const chart = this.chart
    const service = this.service
    const lastCandle = chart.dataZoom.data[chart.dataZoom.data.length - 1]
    const { y } = service.mapDataToCoordinate(lastCandle.time, lastCandle.close)
    const status = lastCandle.close >= lastCandle.open ? 'up' : 'down'
    this.drawYAxisLabelPolygon(
      y,
      status === 'up' ? '#027F57' : '#A71F3A',
      status === 'up' ? '#03A46B' : '#C02944',
      lastCandle.close
    )
  }
}
