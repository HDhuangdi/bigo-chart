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
    const { chart, view, service } = this

    const x = e.offsetX
    const y = e.offsetY

    chart.nowMousePosition = { x, y }
    // 绘制
    if (!chart.isMouseDown) return view.draw()
    const diffX = chart.prevMousePosition.x - chart.nowMousePosition.x
    const lastCandleTime = chart.bars[chart.bars.length - 1].time
    const firstCandleTime = chart.bars[0].time
    const newDataZoomXAxisStartValue =
      chart.dataZoom.xAxisStartValue + chart.dragCoefficient * diffX
    const newDataZoomXAxisEndValue =
      chart.dataZoom.xAxisEndValue + chart.dragCoefficient * diffX

    // 更新拖动系数
    chart.dragCoefficient = (chart.xAxisUnitsVisiable / chart.klineUnit) * 40
    // 边界处理
    if (
      lastCandleTime < newDataZoomXAxisStartValue ||
      firstCandleTime > newDataZoomXAxisEndValue
    ) {
      return
    }

    chart.dataZoom.xAxisStartValue = newDataZoomXAxisStartValue
    chart.dataZoom.xAxisEndValue = newDataZoomXAxisEndValue

    // 分页 提前20个k线单位开始请求
    if (newDataZoomXAxisStartValue - 20 * chart.klineUnit <= firstCandleTime) {
      service.loadMoreData()
      return
    }

    view.draw()
    chart.prevMousePosition = { x, y }
  }

  // 鼠标抬起事件
  onMouseUp () {
    const chart = this.chart
    chart.isMouseDown = false
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
}
