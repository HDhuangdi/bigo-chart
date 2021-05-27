import { domUtils, canvasUtils, warn } from './utils'
import './styles/chart.css'
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
  cursorCanvasUtils
  domUtils
  // 行情单位,一根k线为多少时间
  tickerUnit
  // 当前光标所在的行情信息
  cursorTicker
  // 价格数据精度
  priceDigitNumber = 2
  // 交易量数据精度
  volumeDigitNumer = 3
  // MA list
  MAOptions = [
    {
      color: '#FF00FF',
      interval: 5
    },
    {
      color: '#CF3049',
      interval: 10
    },
    {
      color: '#00CCCC',
      interval: 30
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

    this.checkOptions(options)
    this.container = document.querySelector(this.options.el)

    if (!this.container) {
      warn('invalid dom')
    }
    this.domUtils = domUtils(this.container)
    this.view.createElements()
    this.canvasUtils = canvasUtils(this.view.ctx)
    this.cursorCanvasUtils = canvasUtils(this.view.cursorCtx)

    if (options.MA) {
      this.MAOptions = options.MA
    }
    this.maxMAInterval = Math.max(
      ...this.MAOptions.map((item) => item.interval)
    )
    this.bars = options.bars.sort((a, b) => a.time - b.time)
    // 检查是否有交易量
    if (this.options.hasVolume) {
      this.options.hasVolume = this.bars.every((bar) => !!bar.volume)
    }
    this.tickerUnit = this.bars[1].time - this.bars[0].time

    this.view.initChart() // 17ms
  }

  // 依赖注入
  inject () {
    this.service.inject(this.view, this.controller, this)
    this.controller.inject(this.view, this.service, this)
    this.view.inject(this.service, this.controller, this)
  }

  // 检查配置项
  checkOptions (options) {
    if (!options || !Object.keys(options).length) {
      warn('invalid options')
    }
    this.options = options
  }

  // 订阅数据
  subscribeBars (value, volume, time) {
    const lastCandle = this.bars[this.bars.length - 1]
    const candleToUpdate = {
      open: lastCandle.open,
      high: lastCandle.high,
      low: lastCandle.low,
      close: value,
      volume: lastCandle.volume,
      time: lastCandle.time
    }
    if (time - lastCandle.time >= this.tickerUnit) {
      // new candle
      candleToUpdate.open = lastCandle.close
      candleToUpdate.high = value
      candleToUpdate.low = value
      candleToUpdate.time = time
      candleToUpdate.volume = volume
      this.bars.push(candleToUpdate)
    } else {
      // update last candle
      if (value > lastCandle.high) {
        candleToUpdate.high = value
      }
      if (value < lastCandle.low) {
        candleToUpdate.low = value
      }
      candleToUpdate.volume += volume
      this.bars[this.bars.length - 1] = candleToUpdate
    }
    this.view.draw()
  }
}
