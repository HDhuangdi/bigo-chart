import { getAVG, fixNumber } from './utils'

export default class Service {
  view
  controller
  chart
  // 1px 为多少x轴单位
  unitToXAxisPx = 0
  // 1px 为多少y轴单位 k线图
  klineUnitToYAxisPx = 0
  // 1px 为多少y轴单位 交易量图
  volumeUnitToYAxisPx = 0
  highestVolume
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

    // 根据各自的图表高度和y轴范围算出1px为多少y轴单位
    this.klineUnitToYAxisPx =
      (this.dataZoom.klineYAxisEndValue - this.dataZoom.klineYAxisStartValue) /
      view.klineChartHeight
    this.volumeUnitToYAxisPx =
      (this.dataZoom.volumeYAxisEndValue -
        this.dataZoom.volumeYAxisStartValue) /
      view.volumeChartHeight
  }

  // 计算x轴所有标签的坐标
  calcXAxisCoordinate () {
    const { chart } = this
    // 每隔count个画一个刻度
    const count = Math.floor(this.dataZoom.data.length / 8)
    console.log()
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
  calcYAxisCoordinate (type = 'kline') {
    const { view } = this

    let intervalValue
    let interval
    // volume标签可以画到的最高位置
    const volumeLabelEndValue = this.highestVolume

    if (type === 'kline') {
      interval = view.chartYAxisUnitsVisiable
      intervalValue =
        (this.dataZoom.klineYAxisEndValue -
          this.dataZoom.klineYAxisStartValue) /
        (view.chartYAxisUnitsVisiable - 1)
    } else {
      interval = view.volumeYAxisUnitsVisiable
      intervalValue =
        (volumeLabelEndValue - this.dataZoom.volumeYAxisStartValue) /
        (view.volumeYAxisUnitsVisiable - 1)
    }

    const yAxisData = []

    for (let index = 0; index < interval; index++) {
      let value
      if (type === 'kline') {
        value = this.dataZoom.klineYAxisStartValue + index * intervalValue
      } else {
        value = this.dataZoom.volumeYAxisStartValue + index * intervalValue
      }
      // 将数据映射成坐标
      const res = this.mapDataToCoordinate(0, value, type)
      yAxisData.push({
        x: view.padding.left + view.chartWidth,
        y: res.y,
        value
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
      fixNumber(
        Math.max(...data.map((item) => item.high)),
        chart.priceDigitNumber
      )
    )
    view.padding.top = 15 * view.dpr
    view.padding.bottom = 20 * view.dpr
    view.padding.left = 15 * view.dpr

    view.padding.right = textWidth + 10 * view.dpr /** 为了美观 10px 冗余 */

    view.chartHeight =
      view.canvasHeight - view.padding.top - view.padding.bottom

    view.klineChartHeight = view.chartHeight - view.volumeChartHeight

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

    // 实际在屏幕上显示出的data
    this.dataZoom.data = chart.bars.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue &&
        bar.time >= this.dataZoom.xAxisStartValue
    )

    // 真正截取的data (为了拖动连贯性,需要前后多拿l个)
    this.dataZoom.realData = chart.bars.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue + chart.klineUnit &&
        bar.time >= this.dataZoom.xAxisStartValue - chart.klineUnit
    )

    // y轴更新
    const sortedData = Array.prototype
      .concat([], this.dataZoom.realData)
      .sort((a, b) => b.high - a.high)
    // 行情y轴最高/最低的数据
    const highest = sortedData[0].high
    sortedData.sort((a, b) => a.low - b.low)
    const lowest = sortedData[0].low
    this.dataZoom.klineYAxisEndValue =
      highest + (highest - lowest) * this.yAxisBuffer
    this.dataZoom.klineYAxisStartValue =
      lowest - (highest - lowest) * this.yAxisBuffer

    // 交易量y轴最高/最低的数据
    this.highestVolume = Math.max(...sortedData.map((item) => item.volume))
    this.dataZoom.volumeYAxisEndValue =
      this.highestVolume + this.highestVolume * this.yAxisBuffer
    this.dataZoom.volumeYAxisStartValue = 0
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
                chart.priceDigitNumber
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
  mapDataToCoordinate (time, value, type = 'kline') {
    const { view } = this

    const position = {
      x: 0,
      y: 0
    }

    position.x =
      view.padding.left +
      ((time - this.dataZoom.xAxisStartValue) / this.unitToXAxisPx).toFixed(1) *
        1

    if (type === 'kline') {
      const height =
        (
          (value - this.dataZoom.klineYAxisStartValue) /
          this.klineUnitToYAxisPx
        ).toFixed(1) * 1
      position.y = view.padding.top + view.klineChartHeight - height
    } else {
      const height =
        (
          (value - this.dataZoom.volumeYAxisStartValue) /
          this.volumeUnitToYAxisPx
        ).toFixed(1) * 1
      position.y = view.padding.top + view.chartHeight - height
    }

    return position
  }

  // 坐标 => 数据 映射 (此处的坐标需要传递加上padding后的换算值)
  mapCoordinateToData (x, y) {
    const { chart, view } = this

    const data = {
      time: 0,
      value: 0,
      type: ''
    }

    data.time = Math.floor(
      this.dataZoom.xAxisStartValue + x * this.unitToXAxisPx
    )

    let yDiff = view.klineChartHeight - y

    if (yDiff < 0) {
      // TODO volume chart
      data.type = 'volume'
      yDiff = view.chartHeight - y
      data.value =
        (
          this.dataZoom.volumeYAxisStartValue +
          yDiff * this.volumeUnitToYAxisPx
        ).toFixed(chart.priceDigitNumber) * 1
    } else {
      // kline chart
      data.value =
        (
          this.dataZoom.klineYAxisStartValue +
          yDiff * this.klineUnitToYAxisPx
        ).toFixed(chart.priceDigitNumber) * 1
      data.type = 'price'
    }

    return data
  }

  // 根据坐标寻找K线
  findKline (x, y) {
    const { chart, view } = this

    // 鼠标所指的坐标映射
    const { time, type } = this.mapCoordinateToData(
      x - view.padding.left,
      y - view.padding.top
    )

    // 寻找鼠标所指的k线
    const [candle] = this.dataZoom.data.filter(
      (data) => data.time <= time && data.time + chart.klineUnit >= time
    )

    return { candle, type }
  }
}
