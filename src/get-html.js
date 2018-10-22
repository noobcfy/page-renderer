const writer = require('./file/htmlFileWrite')
const minify = require('html-minifier').minify
const getHtml = async (baseURL, path, page, option) => {
  let options = Object.assign({}, option)
  try {
    if (typeof options.handlePageBefore === 'function') {
      await options.handlePageBefore(page)
    }

    await page.goto(baseURL + path, {waitUntil: options.waitUntil})

    await page.evaluate(options => {
      return new Promise((resolve, reject) => (
        setTimeout(() => resolve(), options.renderAfterTime || 100)
      ))
    }, options).catch(e => {
      console.log(e)
    })
    await page.addScriptTag({
      content: `var PRERENDER = true`
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
    // page.close()
    return promise
  } catch (e) {
    console.log(e)
  }
}

module.exports = getHtml
