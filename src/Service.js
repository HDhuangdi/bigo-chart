import { getAVG } from './utils'

export default class Service {
  view
  controller
  chart

  inject (view, controller, chart) {
    this.view = view
    this.controller = controller
    this.chart = chart
  }

  // 计算1像素等于多少x轴单位
  calcUnitToXAxisPx () {
    const chart = this.chart

    chart.unitToXAxisPx = chart.xAxisUnitsVisiable / chart.chartWidth
  }

  // 计算1像素等于多少y轴单位
  calcUnitToYAxisPx () {
    const chart = this.chart

    // 根据chartHeight和y轴范围算出1px为多少y轴单位
    chart.unitToYAxisPx =
      (chart.dataZoom.yAxisEndValue - chart.dataZoom.yAxisStartValue) /
      chart.chartHeight
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
    const chart = this.chart
    const intervalValue =
      (chart.dataZoom.yAxisEndValue - chart.dataZoom.yAxisStartValue) /
      (chart.yAxisUnitsVisiable - 1)
    const yAxisData = []
    for (let index = 0; index < chart.yAxisUnitsVisiable; index++) {
      const res = this.mapDataToCoordinate(
        0,
        chart.dataZoom.yAxisStartValue + index * intervalValue
      )
      yAxisData.push({
        x: chart.padding.left + chart.chartWidth,
        y: res.y,
        value: chart.dataZoom.yAxisStartValue + index * intervalValue
      })
    }
    return yAxisData
  }

  // 计算chart padding
  calcPadding (data) {
    const chart = this.chart

    const { width: textWidth } = chart.canvasUtils.getTextWidthAndHeight(
      chart.axisLabelSize * chart.dpr,
      'sans-serif',
      Math.max(...data.map((item) => item.high))
    )
    chart.padding.top = 15 * chart.dpr
    chart.padding.bottom = 20 * chart.dpr
    chart.padding.left = 15 * chart.dpr

    chart.padding.right = textWidth + 10 * chart.dpr /** 为了美观 10px 冗余 */
    chart.chartHeight =
      chart.canvasHeight - chart.padding.top - chart.padding.bottom
    chart.chartWidth =
      chart.canvasWidth - chart.padding.left - chart.padding.right
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

    chart.dataZoom.xAxisStartValue = newDataZoomXAxisStartValue
    chart.dataZoom.xAxisEndValue = newDataZoomXAxisEndValue
  }

  // 自动计算缩放对象
  calcDataZoom (type = 'update') {
    const chart = this.chart

    if (type === 'init') {
      // x轴更新
      const newDataZoomXAxisEndValue =
        chart.bars[chart.bars.length - 1].time +
        3 * chart.klineUnit -
        chart.rightSideOffset * chart.unitToXAxisPx
      const newDataZoomXAxisStartValue =
        newDataZoomXAxisEndValue - chart.xAxisUnitsVisiable
      this.updateDataZoom(newDataZoomXAxisStartValue, newDataZoomXAxisEndValue)
    } else if (type === 'update') {
      chart.xAxisUnitsVisiable =
        chart.dataZoom.xAxisEndValue - chart.dataZoom.xAxisStartValue
    }

    // data  需要前后多拿maxMAInterval个
    chart.dataZoom.data = chart.bars.filter(
      (bar) =>
        bar.time <= chart.dataZoom.xAxisEndValue &&
        bar.time >= chart.dataZoom.xAxisStartValue
    )
    // y轴更新
    const sortedData = Array.prototype
      .concat([], chart.dataZoom.data)
      .sort((a, b) => b.high - a.high)
    // y轴最高的数据
    const highest = sortedData[0].high
    sortedData.sort((a, b) => a.low - b.low)
    // y轴最低的数据
    const lowest = sortedData[0].low
    // 缓冲系数
    chart.yAxisBuffer = 0.1

    chart.dataZoom.yAxisEndValue =
      highest + (highest - lowest) * chart.yAxisBuffer
    chart.dataZoom.yAxisStartValue =
      lowest - (highest - lowest) * chart.yAxisBuffer
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
          chart.dataZoom.xAxisEndValue +
            chart.maxMAInterval * chart.klineUnit &&
        bar.time >=
          chart.dataZoom.xAxisStartValue - chart.maxMAInterval * chart.klineUnit
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

    if (chart.loadMorePending || !chart.hasMoreData) return

    const firstCandleTime = chart.bars[0].time

    if (chart.options.loadMore) {
      chart.loadMorePending = true
      const newbars = await chart.options.loadMore(firstCandleTime)
      chart.loadMorePending = false
      // empty data
      if (!newbars) {
        chart.hasMoreData = false
        return
      }
      chart.bars = newbars.concat(chart.bars)
      view.draw()
    }
  }

  // 数据 => 坐标 映射
  mapDataToCoordinate (time, value) {
    const chart = this.chart

    const position = {
      x: 0,
      y: 0
    }

    position.x =
      chart.padding.left +
      ((time - chart.dataZoom.xAxisStartValue) / chart.unitToXAxisPx).toFixed(
        1
      ) *
        1

    const height =
      ((value - chart.dataZoom.yAxisStartValue) / chart.unitToYAxisPx).toFixed(
        1
      ) * 1

    position.y = chart.padding.top + chart.chartHeight - height

    return position
  }

  // 坐标 => 数据 映射 (此处的坐标需要传递加上padding后的换算值)
  mapCoordinateToData (x, y) {
    const chart = this.chart

    const data = {
      time: 0,
      value: 0
    }

    data.time = Math.floor(
      chart.dataZoom.xAxisStartValue + x * chart.unitToXAxisPx
    )
    data.value =
      (
        chart.dataZoom.yAxisStartValue +
        (chart.chartHeight - y) * chart.unitToYAxisPx
      ).toFixed(chart.digitNumber) * 1
    return data
  }
}
