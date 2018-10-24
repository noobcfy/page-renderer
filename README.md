# page-renderer

## 动态渲染单页面应用
模块基于puppeteer进行页面抓取，启动一个渲染服务器利用headless的chrome访问单页面应用页面，待请求完成将所得的页面dom抓取生成静态html。

## 安装

    npm i git+https://github.com/CaoFeiYu/page-renderer.git#develop
## 启动

    npm run render-server
    
## 配置
业务模块可在根目录新建 rendererOptions.js 导出一个options对象可对如下配置进行复写
```js
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
```
## export 导出对象

> getPrerenderData(key)  

获取预渲染数据方法，通过此方法可将服务器渲染获取的数据转化成客户端数据，减少客户端访问时的请求

> setPrerenderData(key, value)

设置预渲染数据方法，业务项目通过此方法设置预渲染数据，服务端请求后写入html中，客户端访问时就可以不用请求接口了

> needPrerender

给客户端返回是否已服务端静态化过的标志，如已静态化将返回false,如未静态化则返回true

> install

用于vue项目的对接，可当成vue插件来use，给vue增加了getPrerenderData、setPrerenderData、needPrerender方法

