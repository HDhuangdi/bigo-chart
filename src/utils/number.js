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

  if (value === 0) return '0'
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

export function simplifyNumber (value, fixedLength) {
  let result
  if (Number(value) >= 10000) {
    result = fixNumber(value / 1000, 2) + 'k'
  } else {
    result = fixNumber(value, fixedLength)
  }
  return result
}
