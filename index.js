// 获取预渲染数据方法
const getPrerenderData = function (key) {
  if (window && window.PRERENDER_DATA) {
    return window.PRERENDER_DATA[key] || null
  }
  return null
}

const setPrerenderData = function (key, val) {
  if (window && window.PRERENDER_DATA) {
    window.PRERENDER_DATA[key] = val
  } else {
    window.PRERENDER_DATA = {}
    window.PRERENDER_DATA[key] = val
  }
}

const install = function (Vue) {
  Vue.prototype.getPrerenderData = getPrerenderData
  Vue.prototype.setPrerenderData = setPrerenderData
}

module.exports = {
  getPrerenderData,
  setPrerenderData,
  install
}
