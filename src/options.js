
const options = {
  staticPort: '', // 静态文件服务器端口,可不传自动查询可用端口
  serverPort: 9000, // 渲染服务器端口
  routes: [],      // 渲染页面路径path 默认全部
  initRender: [],     // 初始化渲染的页面path
  renderBrowserOptions: {},  // 渲染browser设置想参加puppeteer.browser配置
  minifyHtml: true,  // 压缩html
  handlePageBefore: async (page) => { // page跳转前的处理
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => { // 渲染时静态资源请求拦截节约时间
      if (/.*?\/(?:.*?\.(?!html|jsp|htm$)|[^\.]*$)/.test(interceptedRequest.url()) && /\./.test(interceptedRequest.url))
        interceptedRequest.continue();
      else
        interceptedRequest.abort();
    });
  },
  // 参考puppeteer.page.goto options load - 页面的load事件触发时
  //   domcontentloaded - 页面的 DOMContentLoaded 事件触发时
  //   networkidle0 - 不再有网络连接时触发（至少500毫秒后）
  //    networkidle2 - 只有2个网络连接时触发（至少500毫秒后）
  waitUntil: 'networkidle0',
  renderAfterTime: 5000 // 渲染延时
}

module.exports = options
