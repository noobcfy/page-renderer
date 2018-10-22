const puppeteer = require('puppeteer')
const broswer = async (options) => {
  return await puppeteer.launch(Object.assign({
    headless: true
  }, options))
}
module.exports = broswer
