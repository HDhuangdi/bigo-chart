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

export function domUtils (container) {
  function createElm (tag, attrs) {
    const el = document.createElement(tag)
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        el[key] = attrs[key]
      }
    }
    return el
  }

  function setStyle (elm, styles) {
    for (const key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        elm.style[key] = styles[key]
      }
    }
  }

  function appendElms (elms, parent) {
    const _parent = parent || container
    if (Array.isArray(elms)) {
      elms.forEach((elm) => _parent.appendChild(elm))
    } else {
      _parent.appendChild(elms)
    }
  }

  function getDOMElm (selector, container, ...args) {
    let elm = document.querySelector(selector)
    if (!elm) {
      elm = createElm(...args)
      appendElms(elm, container)
    }
    return elm
  }

  return {
    createElm,
    appendElms,
    setStyle,
    getDOMElm
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

export function fixNumber (value, fixedLength) {
  // 小数补0逻辑
  function fixed (fixNum = '', fixedLength) {
    // 如果有定义要求补零的长度
    if (fixedLength !== undefined) {
      if (fixedLength !== 0) {
        // 如果不存在小数部分,全部补零
        if (!fixNum) {
          for (let index = 0; index < fixedLength; index++) {
            fixNum += '0'
          }
        } else if (fixNum.length > fixedLength) {
          // 如果小数部分的长度比要求补零的长度长,截取
          fixNum = fixNum.slice(0, fixedLength)
        } else {
          // 如果小数部分的长度比要求补零的长度短,补零剩余部分
          for (
            let index = 0, l = fixedLength - fixNum.length;
            index < l;
            index++
          ) {
            fixNum += '0'
          }
        }
      } else if (fixedLength === 0) {
        // 如果要求补零的长度为0,省略小数部分
        fixNum = ''
      }
    }

    if (fixNum) {
      fixNum = '.' + fixNum
    }

    return fixNum
  }
  if (value === 0) return '0.00'
  if (!value) return '--'
  let fixNum = value.toString().split('.')[1] // 获取小数部分
  const intPart = Number(value.toString().split('.')[0]) // 获取整数部分
  fixNum = fixed(fixNum, fixedLength)

  if (
    value.toString().indexOf('-') !== -1 &&
    Math.abs(parseFloat(intPart)) <= 0
  ) {
    return '-' + `${intPart}${fixNum}`
  } else {
    return `${intPart}${fixNum}`
  }
}
