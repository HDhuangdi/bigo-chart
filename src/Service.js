import { getAVG, simplifyNumber } from './utils'

export default class Service {
  view
  controller
  chart
  // 1px 为多少x轴单位
  unitToXAxisPx = 0
  // 1px 为多少y轴单位 k线图
  candleUnitToYAxisPx = 0
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

  // 计算1像素等于多少x轴单位    ms/px
  calcUnitToXAxisPx () {
    const { view } = this
    this.unitToXAxisPx =
      (this.dataZoom.xAxisEndValue - this.dataZoom.xAxisStartValue) /
      view.chartWidth
  }

  // 计算1像素等于多少y轴单位
  calcUnitToYAxisPx () {
    const { view } = this

    // 根据各自的图表高度和y轴范围算出1px为多少y轴单位
    this.candleUnitToYAxisPx =
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
    // 比值
    const ratio =
      (this.dataZoom.xAxisEndValue - this.dataZoom.xAxisStartValue) /
      chart.tickerUnit

    // 每隔count个画一个刻度
    const count = Math.floor(ratio / 10)
    const xAxisData = []
    for (let index = 0; index < chart.bars.length; index += count) {
      xAxisData.push({
        time: chart.bars[index].time,
        value: 0
      })
    }

    // x时间
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
  calcYAxisCoordinate (type = 'candle') {
    const { view } = this

    let intervalValue
    let interval
    // volume标签可以画到的最高位置
    const volumeLabelEndValue = this.highestVolume

    if (type === 'candle') {
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
      if (type === 'candle') {
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
      simplifyNumber(
        Math.max(...data.map((item) => item.volume)),
        chart.volumeDigitNumber
      )
    )

    view.padding.top = 15 * view.dpr
    view.padding.bottom = 20 * view.dpr
    view.padding.left = 15 * view.dpr
    view.padding.right = Math.round(textWidth) + view.scaleHeight + 5 * view.dpr
  }

  // 手动更新缩放对象
  updateDataZoom (newDataZoomXAxisStartValue, newDataZoomXAxisEndValue) {
    const { chart } = this
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
      view.xAxisUnitsVisiable = chart.tickerUnit * 120
      // x轴更新
      const newDataZoomXAxisEndValue =
        chart.bars[chart.bars.length - 1].time + 3 * chart.tickerUnit

      const newDataZoomXAxisStartValue =
        newDataZoomXAxisEndValue -
        view.xAxisUnitsVisiable -
        3 * chart.tickerUnit
      this.updateDataZoom(newDataZoomXAxisStartValue, newDataZoomXAxisEndValue)
    } else if (type === 'update') {
      view.xAxisUnitsVisiable =
        this.dataZoom.xAxisEndValue - this.dataZoom.xAxisStartValue
    }

    // 计算MA线所需数据 this.dataZoom.MAData
    this.calcMAList()

    // 真正截取的data (为了拖动连贯性,需要前后各多拿1个)
    this.dataZoom.realData = this.dataZoom.MAData.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue + chart.tickerUnit &&
        bar.time >= this.dataZoom.xAxisStartValue - chart.tickerUnit
    )
    // 实际在屏幕上显示出的data
    this.dataZoom.data = this.dataZoom.realData.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue &&
        bar.time >= this.dataZoom.xAxisStartValue
    )

    // 行情y轴最高/最低的数据
    const highest = Math.max(...this.dataZoom.realData.map((item) => item.high))
    const lowest = Math.min(...this.dataZoom.realData.map((item) => item.low))
    // Y轴缓冲系数 最大,最小
    this.dataZoom.klineYAxisEndValue =
      highest + (highest - lowest) * this.yAxisBuffer
    this.dataZoom.klineYAxisStartValue =
      lowest - (highest - lowest) * this.yAxisBuffer

    // 交易量y轴最高/最低的数据
    this.highestVolume = Math.max(
      ...this.dataZoom.realData.map((item) => item.volume)
    )
    this.dataZoom.volumeYAxisEndValue =
      this.highestVolume + this.highestVolume * this.yAxisBuffer
    this.dataZoom.volumeYAxisStartValue = 0
  }

  // 计算MA points
  calcMAPoints () {
    const chart = this.chart
    chart.MAOptions.forEach(({ interval }, index, arr) => {
      const MAPoints = []
      // MA线求和的收集器
      const reducer = []
      for (let index = 0, l = this.dataZoom.MAData.length; index < l; index++) {
        const ticker = this.dataZoom.MAData[index]
        const point = {
          value: ticker.close,
          time: ticker.time
        }
        reducer.push(point)
        if (index >= interval - 1) {
          MAPoints.push({
            value:
              getAVG(reducer.map((item) => item.value)).toFixed(
                chart.priceDigitNumber
              ) * 1,
            time: point.time
          })
          reducer.shift()
        }
      }
      arr[index].points = MAPoints
    })
  }

  // 计算当前屏幕上需要显示完全的MA线所需截取bars的范围
  calcMAList () {
    const chart = this.chart
    this.dataZoom.MAData = chart.bars.filter(
      (bar) =>
        bar.time <= this.dataZoom.xAxisEndValue &&
        bar.time >=
          this.dataZoom.xAxisStartValue - chart.maxMAInterval * chart.tickerUnit
    )
  }

  // 格式化行情数据
  formatTickerData (ticker) {
    // 状态
    ticker.status = ticker.close >= ticker.open ? 'up' : 'down'
    // 振幅
    ticker.amplitude =
      (((ticker.high - ticker.low) * 100) / ticker.low).toFixed(2) + '%'
    // 涨跌幅
    ticker.change =
      (((ticker.close - ticker.high) * 100) / ticker.low).toFixed(2) + '%'
  }

  // 分页逻辑
  async loadMoreData () {
    const { chart } = this

    if (this.loadMorePending || !this.hasMoreData) return

    const firstTickerTime = chart.bars[0].time

    if (chart.options.loadMore) {
      this.loadMorePending = true

      let newbars = await chart.options.loadMore(firstTickerTime)
      this.loadMorePending = false
      // empty data
      if (!newbars) {
        this.hasMoreData = false
        return
      }
      newbars = chart.initBars(newbars)
      const newLastTicker = newbars[newbars.length - 1].time
      // 防止重复
      if (newLastTicker.time === firstTickerTime.time) {
        newbars.splice(newbars.length - 1, 1)
      }

      chart.bars = newbars.concat(chart.bars)
    }
  }

  // 数据 => 坐标 映射
  mapDataToCoordinate (time, value, type = 'candle') {
    const { view } = this
    const position = {
      x: 0,
      y: 0
    }
    // 如果time等于0的话就 return  position.x = 0 减小运算
    if (time === 0) {
      position.x = view.padding.left + view.chartWidth
    } else {
      position.x = Math.round(
        view.padding.left +
          (time - this.dataZoom.xAxisStartValue) / this.unitToXAxisPx
      )
    }
    // value == 0 return
    if (!value && type === 'candle') return position
    if (type === 'candle') {
      const height =
        (value - this.dataZoom.klineYAxisStartValue) / this.candleUnitToYAxisPx
      position.y = Math.round(view.padding.top + view.klineChartHeight - height)
    } else {
      const height =
        (value - this.dataZoom.volumeYAxisStartValue) / this.volumeUnitToYAxisPx
      position.y = Math.round(view.padding.top + view.chartHeight - height)
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
          yDiff * this.candleUnitToYAxisPx
        ).toFixed(chart.priceDigitNumber) * 1
      data.type = 'price'
    }

    return data
  }

  // 根据坐标寻找K线
  findTicker (x, y) {
    const { chart, view } = this

    // 鼠标所指的坐标映射
    const { time, value, type } = this.mapCoordinateToData(
      x - view.padding.left,
      y - view.padding.top
    )

    // TODO (有点小问题) 寻找鼠标所指的k线
    const [ticker] = this.dataZoom.data.filter(
      (data) => data.time <= time && data.time + chart.tickerUnit >= time
    )

    return { ticker, value, type }
  }
}
