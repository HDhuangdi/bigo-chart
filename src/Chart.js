import canvasUtils from './utils.js'
import logo from './logo.png'
import Controller from './Controller'
import Service from './Service'
import View from './View'

export default class QuoteChart {
  view
  service
  controller
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
  // xy轴刻度线长度
  scaleHeight
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

  // 当前MA中最大的周期,用于计算MA列表需要截取bars上的范围
  maxMAInterval

  constructor (options) {
    this.options = options
    this.logo = new Image()
    this.logo.src = options.logo || logo
    if (options.MA) {
      this.MAOptions = options.MA
    }
    this.maxMAInterval = Math.max(
      ...this.MAOptions.map((item) => item.interval)
    )
    this.bars = options.bars
    this.klineUnit = this.bars[1].time - this.bars[0].time

    // 依赖生成并注入
    this.view = new View()
    this.service = new Service()
    this.controller = new Controller()
    this.inject()

    this.canvas = document.querySelector(options.el)
    this.ctx = this.canvas.getContext('2d')
    this.canvasUtils = canvasUtils(this.ctx)

    this.view.highDefinition()
    this.service.calcPadding(this.bars)
    this.controller.registerMouseEvents()
    this.service.calcDataZoom('init')
    this.view.draw()
  }

  // 依赖注入
  inject () {
    this.service.inject(this.view, this.controller, this)
    this.controller.inject(this.view, this.service, this)
    this.view.inject(this.service, this.controller, this)
  }

  // 订阅数据
  subscribeBars (value, volume, time) {
    const lastCandle = this.bars[this.bars.length - 1]
    const candleToUpdate = {
      open: lastCandle.open,
      high: lastCandle.high,
      low: lastCandle.low,
      close: value,
      volume,
      time: lastCandle.time
    }
    if (time - lastCandle.time >= this.klineUnit) {
      // new candle
      candleToUpdate.open = lastCandle.close
      candleToUpdate.high = value
      candleToUpdate.low = value
      candleToUpdate.time = time
      this.bars.push(candleToUpdate)
    } else {
      // update last candle
      if (value > lastCandle.high) {
        candleToUpdate.high = value
      }
      if (value < lastCandle.low) {
        candleToUpdate.low = value
      }
      this.bars[this.bars.length - 1] = candleToUpdate
    }

    this.view.draw()
  }
}
