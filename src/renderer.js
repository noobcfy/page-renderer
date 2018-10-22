const puppeteer = require('puppeteer')
const broswer = async (options) => {
  return await puppeteer.launch(Object.assign({
    headless: false
  }, options))
}
module.exports = broswer
