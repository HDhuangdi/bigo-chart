export default function canvasUtils (ctx) {
  function drawLine (
    startPosition,
    endPosition,
    color = '#fff',
    close = true,
    dash = [0, 0]
  ) {
    if (close) {
      ctx.beginPath()
    }
    ctx.setLineDash(dash)
    ctx.moveTo(startPosition.x, startPosition.y)
    ctx.lineTo(endPosition.x, endPosition.y)
    ctx.strokeStyle = color
    if (close) {
      ctx.stroke()
    }
  }

  function drawRect (x, y, width, height, color = '#fff') {
    ctx.fillStyle = color
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.fill()
  }

  function drawPolygon (pointsList, type, color) {
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.moveTo(pointsList[0].x, pointsList[0].y)
    pointsList.forEach((point, index) => {
      if (index >= 1) {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.lineTo(pointsList[0].x, pointsList[0].y)

    ctx[type + 'Style'] = color
    ctx.closePath()
    ctx[type]()
  }

  function drawText (x, y, text, fontStyle, baseLine, color, align) {
    ctx.font = fontStyle
    ctx.textBaseline = baseLine
    ctx.textAlign = align
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }

  function getTextWidthAndHeight (fontSize, fontStyle, text) {
    ctx.font = fontSize + 'px ' + fontStyle
    return {
      width: ctx.measureText(text).width,
      height: fontSize
    }
  }

  return {
    drawLine,
    drawRect,
    drawPolygon,
    drawText,
    getTextWidthAndHeight
  }
}

export function dateFormat (fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
      )
    }
  }
  return fmt
}

export function getAVG (list) {
  const sum = list.reduce((a, b) => a + b, 0)

  return sum / list.length
}
