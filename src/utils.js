export default function canvasUtils(ctx) {
  function drawLine(startPosition, endPosition, color = "#fff", close = true) {
    if (close) {
      ctx.beginPath()
    }
    ctx.moveTo(startPosition.x, startPosition.y)
    ctx.lineTo(endPosition.x, endPosition.y)
    ctx.strokeStyle = color
    if (close) {
      ctx.stroke()
    }
  }

  function drawRect(x, y, width, height, color = "#fff") {
    ctx.fillStyle = color
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.fill()
  }

  function drawText(x, y, text, fontStyle, baseLine, color, align) {
    ctx.font = fontStyle
    ctx.textBaseline = baseLine
    ctx.textAlign = align
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }

  function getTextWidth(fontStyle, text) {
    ctx.font = fontStyle
    return ctx.measureText(text).width
  }

  return {
    drawLine,
    drawRect,
    drawText,
    getTextWidth,
  }
}

export function dateFormat(fmt, date) {
  let ret
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (const k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      )
    }
  }
  return fmt
}

export function getAVG(list) {
  const sum = list.reduce((a, b) => a + b, 0)

  return sum / list.length
}
