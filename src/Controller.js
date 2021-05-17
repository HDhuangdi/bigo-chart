export default class Controller {
  view
  service
  chart

  inject (view, service, chart) {
    this.view = view
    this.service = service
    this.chart = chart
  }

  // 注册事件
  registerMouseEvents () {
    const chart = this.chart

    chart.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    chart.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    chart.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    chart.canvas.addEventListener('mousewheel', this.onMouseWeel.bind(this))
  }

  // 鼠标点击事件
  onMouseDown (e) {
    const chart = this.chart

    chart.isMouseDown = true
    chart.prevMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  // 鼠标移动事件
  onMouseMove (e) {
    const chart = this.chart
    const view = this.view

    // 绘制鼠标十字线
    view.drawCursorCross(e.offsetX, e.offsetY)

    if (!chart.isMouseDown) return
    chart.nowMousePosition = { x: e.offsetX, y: e.offsetY }
    const diffX = chart.prevMousePosition.x - chart.nowMousePosition.x
    const lastCandleTime = chart.bars[chart.bars.length - 1].time
    const firstCandleTime = chart.bars[0].time
    const newDataZoomXAxisStartValue =
      chart.dataZoom.xAxisStartValue + chart.dragCoefficient * diffX
    const newDataZoomXAxisEndValue =
      chart.dataZoom.xAxisEndValue + chart.dragCoefficient * diffX

    // 更新拖动系数
    chart.dragCoefficient = (chart.xAxisUnitsVisiable / chart.klineUnit) * 40
    // 边界处理  分页  4个K线单位冗余
    if (newDataZoomXAxisStartValue + 20 * chart.klineUnit >= lastCandleTime) {
      return
    }
    if (newDataZoomXAxisEndValue - 20 * chart.klineUnit <= firstCandleTime) {
      // 分页
      return
    }

    chart.dataZoom.xAxisStartValue = newDataZoomXAxisStartValue
    chart.dataZoom.xAxisEndValue = newDataZoomXAxisEndValue

    view.draw()
    chart.prevMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  // 鼠标抬起事件
  onMouseUp (e) {
    const chart = this.chart

    chart.isMouseDown = false
    chart.prevMousePosition = {}
    chart.nowMousePosition = {}
  }

  // 滚轮事件
  onMouseWeel (e) {
    const chart = this.chart
    const view = this.view
    const service = this.service

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
      if (chart.dataZoom.data.length <= 20) return
      // 放大
      chart.dataZoom.xAxisStartValue =
        chart.dataZoom.xAxisStartValue + 1000 * 120
      chart.dataZoom.xAxisEndValue = chart.dataZoom.xAxisEndValue - 1000 * 120
    } else {
      if (chart.dataZoom.data.length >= 200) return
      // 缩小
      chart.dataZoom.xAxisStartValue =
        chart.dataZoom.xAxisStartValue - 1000 * 120
      chart.dataZoom.xAxisEndValue = chart.dataZoom.xAxisEndValue + 1000 * 120
    }
    service.calcDataZoom()
    view.draw()
  }

  // 订阅数据
  subscribeBars (value, time) {
    const chart = this.chart
    const view = this.view

    // 1621092420000
    const lastCandle = chart.bars[chart.bars.length - 1]

    const candleTpUpdate = {
      close: lastCandle.close,
      high: lastCandle.high,
      low: lastCandle.low,
      open: lastCandle.open,
      time: lastCandle.time
    }
    if (time - lastCandle.time >= chart.klineUnit) {
      // new
      candleTpUpdate.close = value
      candleTpUpdate.open = lastCandle.close
      candleTpUpdate.high = value
      candleTpUpdate.low = value
      candleTpUpdate.time = time
      chart.bars.push(candleTpUpdate)
    } else {
      // update
      candleTpUpdate.close = value
      candleTpUpdate.time = time
      chart.bars[chart.bars.length - 1] = candleTpUpdate
    }

    view.draw()
  }
}
