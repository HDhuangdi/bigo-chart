import { getAVG, fixNumber } from './utils'

export default class Service {
  view
  controller
  chart
  // 1px 为多少x轴单位
  unitToXAxisPx = 0
  // 1px 为多少y轴单位
  unitToYAxisPx = 0
  // 缩放对象
  dataZoom = {}
  // 正在加载更多数据
  loadMorePending
  // 是否还有更多数据?
  hasMoreData = true
  // y轴缓冲系数
  yAxisBuffer = 0.1

  inject (view, controller, chart) {
    this.view = view
    this.controller = controller
    this.chart = chart
  }

  // 计算1像素等于多少x轴单位
  calcUnitToXAxisPx () {
    const { view } = this

    this.unitToXAxisPx = view.xAxisUnitsVisiable / view.chartWidth
  }

  // 计算1像素等于多少y轴单位
  calcUnitToYAxisPx () {
    const { view } = this

    // 根据chartHeight和y轴范围算出1px为多少y轴单位
    this.unitToYAxisPx =
      (this.dataZoom.yAxisEndValue - this.dataZoom.yAxisStartValue) /
      view.chartHeight
  }

  // 计算x轴所有标签的坐标
  calcXAxisCoordinate () {
    const chart = this.chart
    // 每隔count个画一个刻度
    const count = 15

    const xAxisData = []
    for (let index = 0; index < chart.bars.length; index += count) {
      xAxisData.push({
        time: chart.bars[index].time,
        value: 0
      })
    }

    const xAxisPosition = xAxisData.map((data) => {
      const res = this.mapDataToCoordinate(data.time, data.value)
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
    const { view } = this

    const intervalValue =
      (this.dataZoom.yAxisEndValue - this.dataZoom.yAxisStartValue) /
      (view.yAxisUnitsVisiable - 1)
    const yAxisData = []
    for (let index = 0; index < view.yAxisUnitsVisiable; index++) {
      const res = this.mapDataToCoordinate(
        0,
        this.dataZoom.yAxisStartValue + index * intervalValue
      )
      yAxisData.push({
        x: view.padding.left + view.chartWidth,
        y: res.y,
        value: this.dataZoom.yAxisStartValue + index * intervalValue
      })
    }
    return yAxisData
  }

  // 计算chart padding
  calcPadding (data) {
    const { chart, view } = this

    const { width: textWidth } = chart.canvasUtils.getTextWidthAndHeight(
      view.axisLabelSize * view.dpr,
      'sans-serif',
      fixNumber(Math.max(...data.map((item) => item.high)), chart.digitNumber)
    )
    view.padding.top = 15 * view.dpr
    view.padding.bottom = 20 * view.dpr
    view.padding.left = 15 * view.dpr

    view.padding.right = textWidth + 10 * view.dpr /** 为了美观 10px 冗余 */
    view.chartHeight =
      view.canvasHeight - view.padding.top - view.padding.bottom
    view.chartWidth = view.canvasWidth - view.padding.left - view.padding.right
  }

  // 手动更新缩放对象
  updateDataZoom (newDataZoomXAxisStartValue, newDataZoomXAxisEndValue) {
    const chart = this.chart
    const lastCandleTime = chart.bars[chart.bars.length - 1].time
    const firstCandleTime = chart.bars[0].time
    // 边界处理
    if (
      lastCandleTime < newDataZoomXAxisStartValue ||
      firstCandleTime > newDataZoomXAxisEndValue
    ) {
      return
    }

    this.dataZoom.xAxisStartValue = newDataZoomXAxisStartValue
    this.dataZoom.xAxisEndValue = newDataZoomXAxisEndValue
  }

  // 自动计算缩放对象
  calcDataZoom (type = 'update') {
    const { chart, view } = this

    if (type === 'init') {
      // x轴更新
      const newDataZoomXAxisEndValue =
        chart.bars[chart.bars.length - 1].time + 3 * chart.klineUnit

      const newDataZoomXAxisStartValue =
        newDataZoomXAxisEndValue - view.xAxisUnitsVisiable
      this.updateDataZoom(newDataZoomXAxisStartValue, newDataZoomXAxisEndValue)
    } else if (type === 'update') {
      view.xAxisUnitsVisiable =
        this.dataZoom.xAxisEndValue - this.dataZoom.xAxisStartValue
    }

    // data  需要前后多拿maxMAInterval个
    this.dataZoom.data = chart.bars.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue &&
        bar.time >= this.dataZoom.xAxisStartValue
    )
    // y轴更新
    const sortedData = Array.prototype
      .concat([], this.dataZoom.data)
      .sort((a, b) => b.high - a.high)
    // y轴最高的数据
    const highest = sortedData[0].high
    sortedData.sort((a, b) => a.low - b.low)
    // y轴最低的数据
    const lowest = sortedData[0].low

    this.dataZoom.yAxisEndValue =
      highest + (highest - lowest) * this.yAxisBuffer
    this.dataZoom.yAxisStartValue =
      lowest - (highest - lowest) * this.yAxisBuffer
  }

  // 计算MA points
  calcMAPoints () {
    const chart = this.chart

    this.calcMAList()
    chart.MAOptions.forEach(({ interval }, index, arr) => {
      const MAPoints = []
      const reduce = []
      for (let index = 0; index < chart.MAData.length; index++) {
        const point = {
          value: chart.MAData[index].close,
          time: chart.MAData[index].time
        }
        reduce.push(point)
        if (index >= interval - 1) {
          MAPoints.push({
            value:
              getAVG(reduce.map((item) => item.value)).toFixed(
                chart.digitNumber
              ) * 1,
            time: point.time
          })
          reduce.shift()
        }
      }
      arr[index].points = MAPoints
    })
  }

  // 计算当前屏幕上需要显示完全的MA线所需截取bars的范围
  calcMAList () {
    const chart = this.chart
    chart.MAData = chart.bars.filter(
      (bar) =>
        bar.time <=
          this.dataZoom.xAxisEndValue + chart.maxMAInterval * chart.klineUnit &&
        bar.time >=
          this.dataZoom.xAxisStartValue - chart.maxMAInterval * chart.klineUnit
    )
  }

  // 格式化k线数据
  formatKlineData (kline) {
    // 状态
    kline.status = kline.close >= kline.open ? 'up' : 'down'
    // 振幅
    kline.amplitude =
      (((kline.high - kline.low) * 100) / kline.low).toFixed(2) + '%'
    // 涨跌幅
    kline.change =
      (((kline.close - kline.high) * 100) / kline.low).toFixed(2) + '%'
  }

  // 分页逻辑
  async loadMoreData () {
    const { chart, view } = this

    if (this.loadMorePending || !this.hasMoreData) return

    const firstCandleTime = chart.bars[0].time

    if (chart.options.loadMore) {
      this.loadMorePending = true
      const newbars = await chart.options.loadMore(firstCandleTime)
      this.loadMorePending = false
      // empty data
      if (!newbars) {
        this.hasMoreData = false
        return
      }
      chart.bars = newbars.concat(chart.bars)
      view.draw()
    }
  }

  // 数据 => 坐标 映射
  mapDataToCoordinate (time, value) {
    const { view } = this

    const position = {
      x: 0,
      y: 0
    }

    position.x =
      view.padding.left +
      ((time - this.dataZoom.xAxisStartValue) / this.unitToXAxisPx).toFixed(1) *
        1

    const height =
      ((value - this.dataZoom.yAxisStartValue) / this.unitToYAxisPx).toFixed(
        1
      ) * 1

    position.y = view.padding.top + view.chartHeight - height

    return position
  }

  // 坐标 => 数据 映射 (此处的坐标需要传递加上padding后的换算值)
  mapCoordinateToData (x, y) {
    const { chart, view } = this

    const data = {
      time: 0,
      value: 0
    }

    data.time = Math.floor(
      this.dataZoom.xAxisStartValue + x * this.unitToXAxisPx
    )
    data.value =
      (
        this.dataZoom.yAxisStartValue +
        (view.chartHeight - y) * this.unitToYAxisPx
      ).toFixed(chart.digitNumber) * 1
    return data
  }
}
