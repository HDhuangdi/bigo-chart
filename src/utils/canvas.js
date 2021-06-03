export function canvasUtils (ctx) {
  function drawLine (
    startPosition,
    endPosition,
    color = '#fff',
    close = true,
    dash = [0, 0]
  ) {
    if (close) {
      ctx.beginPath()
      ctx.setLineDash(dash)
    }
    ctx.moveTo(startPosition.x, startPosition.y)
    ctx.lineTo(endPosition.x, endPosition.y)
    if (close) {
      ctx.strokeStyle = color
      ctx.stroke()
      // TODO 这里可以优化
      // ctx.closePath()
    }
  }

  function drawRect (x, y, width, height, color = '#fff') {
    ctx.fillStyle = color
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.fill()
  }

  function drawPolygon (pointsList, type, color, width) {
    ctx.beginPath()
    ctx.lineWidth = width
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
