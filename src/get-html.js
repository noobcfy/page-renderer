const writer = require('./file/htmlFileWrite')
const minify = require('html-minifier').minify
const getHtml = async (baseURL, path, page, option) => {
  let options = Object.assign({}, option)
  try {
    if (typeof options.handlePageBefore === 'function') {
      await options.handlePageBefore(page)
    }
    // 打开页面
    await page.goto(baseURL + path, {waitUntil: options.waitUntil})
    // 页面延时
    await page.evaluate(options => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), options.renderAfterTime || 100)
      })
    }, options).catch(e => {
      console.log(e)
    })
    // 渲染数据获取并写入页面window对象
    await page.evaluate(() => {
      if (document.getElementById('PRERENDER')) {
        document.getElementsByTagName('head')[0].removeChild(document.getElementById('PRERENDER'))
      }
      let data = JSON.stringify(window.PRERENDER_DATA)
      let htmlstr = `window.PRERENDER_DATA = ${data};window.PRERENDER = true;`
      let script = document.createElement('script')
      script.type = 'text/javascript'
      script.id = 'PRERENDER'
      script.innerHTML = htmlstr
      document.getElementsByTagName('head')[0].appendChild(script)
    })

    let url = page.url()
    let content = await page.content()
    // 压缩html代码
    if(options.minifyHtml) content = minify(content, {removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true})
    // html后续处理
    content = typeof options.handleHtml === 'function' ? options.handleHtml(content) : content

    let promise = {content: content, redirect: false}
    if (url !== (baseURL + path)) { // url变化了 代表页面重定向了
      promise.redirect = true
    }
    page.close()
    return promise
  } catch (e) {
    console.log(e)
  }
}

module.exports = getHtml
