# bigo-chart

使用 canvas 绘制,可用于股票,基金,加密货币的轻量级交易图表库,支持分时图,蜡烛图

## 安装

```bash
npm install bigo-chart -S
```

## 快速使用

```javascript
import BigoChart from "bigo-chart"
import "bigo-chart/dist/chart.css"

const option = {
  el: "#chart",
  bars,
  symbol: "ETH",
  hasVolume: true,
  logo: "./logo.png",
  chartType: 1,
  interval: "1m",
}
const chart = new BigoChart(option)
```

## 效果展示

- 支持蜡烛图、分时图、交易量图。
- 支持视图缩放、拖拽、分页

![effect](https://img-blog.csdnimg.cn/20210531101251775.gif#pic_center)

- 支持视图实时更新:

![effect](https://img-blog.csdnimg.cn/20210531101551325.gif#pic_center)

## 配置

| 配置名称  | 配置说明                          | 可选值                                                                     | 类型                       |
| --------- | --------------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| el        | 图表容器 id,如:'#chart-container' | /                                                                          | number                     |
| bars      | 历史行情数据                      | { close: number; high: number; low: number; open: number; volume: number } | object                     |
| symbol    | 产品标识                          | /                                                                          | string                     |
| logo      | 公司 logo 路径                    | /                                                                          | string                     |
| chartType | 图表类型                          | 1: 分时图; 2: 蜡烛图                                                       | number                     |
| loadMore  | 分页回调,接受一个参数 endTime     | /                                                                          | (endTime: number) => :bars |
| interval  | 周期                              | 1m,5m,15m,1d                                                               | string                     |

## API

### `subscribeBars(close, volume, time)`

订阅数据,接受 3 个参数(当前行情, 当前新增的交易量, 当前时间),每次收到新数据都需要执行一次.

### `chart.setOption(option)`

产生新的配置,bigo-chart 会将新配置项和老配置项进行合并取舍,由此产生新的图表样式.

## LICENSE

[MIT](https://en.wikipedia.org/wiki/MIT_License)
