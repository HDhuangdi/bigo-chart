export function domUtils(container) {
  function createElm(tag, attrs) {
    const el = document.createElement(tag)
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        el[key] = attrs[key]
      }
    }
    return el
  }

  function setStyle(elm, styles) {
    for (const key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        elm.style[key] = styles[key]
      }
    }
  }

  function appendElms(elms, parent) {
    const _parent = parent || container
    if (Array.isArray(elms)) {
      elms.forEach((elm) => _parent.appendChild(elm))
    } else {
      _parent.appendChild(elms)
    }
  }

  function getDOMElm(selector, container, ...args) {
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
    getDOMElm,
  }
}
