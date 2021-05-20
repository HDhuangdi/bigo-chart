import canvasUtils, { domUtils } from './utils.js'
import './chart.css'
import logo from './logo.png'
import Controller from './Controller'
import Service from './Service'
import View from './View'

export default class BigoChart {
  view
  service
  controller

  options
  bars
  container

  canvasUtils
  domUtils
  // k线单位,一根k线为多少时间
  klineUnit
  // 当前光标所在的K线
  cursorKline
  // 数据精度
  digitNumber = 2
  // MA list
  MAOptions = [
    {
      color: '#FF00FF',
      interval: 7
    },
    {
      color: '#CF3049',
      interval: 25
    },
    {
      color: '#00CCCC',
      interval: 99
    }
  ]

  // 绘制MA所需的数据
  MAData
  // 当前MA中最大的周期,用于计算MA列表需要截取bars上的范围
  maxMAInterval

  constructor (options) {
    // 依赖生成并注入
    this.view = new View()
    this.service = new Service()
    this.controller = new Controller()
    this.inject()

    this.options = options
    this.container = document.querySelector(this.options.el)
    this.domUtils = domUtils(this.container)
    this.view.createElements()
    this.view.ctx = this.view.canvas.getContext('2d')
    this.canvasUtils = canvasUtils(this.view.ctx)

    this.view.logo = new Image()
    this.view.logo.src = options.logo || logo
    if (options.MA) {
      this.MAOptions = options.MA
    }
    this.maxMAInterval = Math.max(
      ...this.MAOptions.map((item) => item.interval)
    )
    this.bars = options.bars
    this.klineUnit = this.bars[1].time - this.bars[0].time

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
