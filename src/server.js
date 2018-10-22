#! node
const Koa = require('koa')
const path = require('path')
// const querystring = require('querystring')
const resolve = file => path.resolve(__dirname, file)
const broswerCreator = require('./renderer')
const getHtml = require('./get-html')
const writeFile = require('./file/htmlFileWrite')
const send = require('koa-send')
let initOptions = require('./options')
const portfinder = require('portfinder')
// 合并业务配置
try {
  const userOptions = require(process.cwd() + '/rendererOptions.js')
  if (userOptions) initOptions = Object.assign(initOptions, userOptions)
} catch (e) {
  console.log('未找到配置模块renderOptions.js,应用默认配置！')
}
const serverInit = async () => {
  let options = Object.assign({}, initOptions)
  if (!options.staticPort) {
    options.staticPort = await portfinder.getPortPromise()
  }
  // 起一个本地静态服务器
  const staticApp = new Koa()
  let staticPort = options.staticPort
  const baseURL = `http://localhost:${staticPort}`
  staticApp.use(require('koa-static')(resolve(process.cwd() + '/dist', {deffer: false})))
  staticApp.use(async (ctx, next) => { // 页面重定向至index
    await send(ctx, '/index.html', {root: resolve(process.cwd() + '/dist')})
    next()
  })
  staticApp.listen(staticPort)
  console.log('静态服务器已启动，端口为' + staticPort)
  const renderServer = new Koa()
  const browser = await broswerCreator(typeof options.renderBrowserOptions === 'object' ? options.renderBrowserOptions : {})
  // 处理渲染请求
  renderServer.use(async (ctx, next) => {
    await next()
    let routerPath = ctx.originalUrl
    if (/.*?\/(?:.*?\.(?!html|jsp|htm$)|[^\.]*$)/.test(routerPath) && /\./.test(routerPath)) {
      return
    }
    let needRender = true
    if (options.routes && options.routes.length) {
      for(let i of options.routes) {
        if (routerPath.indexOf(i) === 0) {
          break
        }
        needRender = false
      }
    }
    await send(ctx, '/index.html', {root: resolve(process.cwd() + '/dist')})
    if (needRender) render(routerPath, options)
  })
  // 页面渲染
  const render = async (routerPath, options) => {
    try {
      // let params = querystring.parse(ctx.originalUrl.replace(/^[^\?]+\??/, ''))
      let renderPromise = new Promise(async (resolve, reject) => {
        try {
          let page = await browser.newPage();
          let res = await getHtml(baseURL, routerPath, page, options)
          if (!res.redirect) { // 如果页面没有重定向则写入文件了
            writeFile(routerPath, res.content)
            resolve(true)
          }
        } catch (e) {
          console.log(e)
          reject(e)
        }
      })
      renderPromise.then(res => {
        console.log(routerPath + '页面静态化完成！')
      })
    } catch (e) {
    }
  }
  // 提供渲染时需要的静态资源
  renderServer.use(require('koa-static')(resolve(process.cwd() + '/dist'), {deffer: true}))

  renderServer.listen(options.serverPort)

  console.log('渲染服务器已启动！端口为' + options.serverPort + (options.initRender.length ? ',即将开始渲染初始化页面':''))
  for(let i of options.initRender) {
    await render(i)
  }
}



serverInit()
