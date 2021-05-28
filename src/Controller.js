export default class Controller {
  view
  service
  chart

  // 当前鼠标是否按下
  isMouseDown = false
  // 上一次移动时鼠标的定位
  prevMousePosition = {}
  // 移动中的鼠标定位
  nowMousePosition = {}

  inject (view, service, chart) {
    this.view = view
    this.service = service
    this.chart = chart
  }

  // 注册事件
  registerMouseEvents () {
    const { chart } = this

    chart.container.addEventListener('mousedown', this.onMouseDown.bind(this))
    chart.container.addEventListener('mousemove', this.onMouseMove.bind(this))
    chart.container.addEventListener('mouseup', this.onMouseUp.bind(this))
    chart.container.addEventListener('mousewheel', this.onMouseWeel.bind(this))
  }

  // 鼠标点击事件
  onMouseDown (e) {
    this.isMouseDown = true
    this.prevMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  // 鼠标移动事件
  onMouseMove (e) {
    const { chart, view, service } = this

    const x = e.offsetX
    const y = e.offsetY

    this.nowMousePosition = { x, y }
    // 绘制
    if (!this.isMouseDown) return view.drawCursorCanvas()
    service.dataZoom.user = true
    const diffX = this.prevMousePosition.x - this.nowMousePosition.x
    // 拖动的距离
    const distance = diffX * service.unitToXAxisPx

    const firstCandleTime = chart.bars[0].time
    const newDataZoomXAxisStartValue =
      service.dataZoom.xAxisStartValue + distance
    const newDataZoomXAxisEndValue = service.dataZoom.xAxisEndValue + distance

    // 分页 提前300个k线单位开始请求
    if (
      newDataZoomXAxisStartValue - 300 * chart.tickerUnit <=
      firstCandleTime
    ) {
      service.loadMoreData()
    }

    service.updateDataZoom(newDataZoomXAxisStartValue, newDataZoomXAxisEndValue)

    view.draw()
    this.prevMousePosition = { x, y }
  }

  // 鼠标抬起事件
  onMouseUp () {
    this.isMouseDown = false
  }

  // 滚轮事件
  onMouseWeel (e) {
    // 屏蔽页面滚动
    e.preventDefault()
    const { view, service } = this
    service.dataZoom.user = true

    let delta
    if (e.wheelDelta) {
      // IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
      delta = e.wheelDelta / 120
      if (window.opera) delta = -delta // 因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
    } else if (e.detail) {
      // FF浏览器使用的是detail,其值为“正负3”
      delta = -e.detail / 3
    }
    if (!delta) return

    let newDataZoomXAxisStartValue
    let newDataZoomXAxisEndValue
    const distance = delta * service.unitToXAxisPx * 10
    if (delta >= 0) {
      if (service.dataZoom.data.length <= 20) return
      // 放大
    } else {
      if (service.dataZoom.data.length >= 200) return
      // 缩小
    }
    /** dis */
    newDataZoomXAxisStartValue = service.dataZoom.xAxisStartValue + distance // eslint-disable-line
    newDataZoomXAxisEndValue = service.dataZoom.xAxisEndValue - distance // eslint-disable-line

    service.updateDataZoom(newDataZoomXAxisStartValue, newDataZoomXAxisEndValue)
    view.draw()
  }
}
