const puppeteer = require('puppeteer')
const broswer = async (options) => {
  return await puppeteer.launch(Object.assign({
    headless: true,
    args:['--no-sandbox']
  }, options))
}
module.exports = broswer
