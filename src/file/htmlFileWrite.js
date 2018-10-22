const fs = require('fs')
path = require('path')
const mkdirp = require('mkdirp')

const writefile = function (path, content) {
  fs.writeFile(process.cwd() + '/dist' + path + '/index.html', content, {encoding: 'UTF-8'}, function (err) {
    console.log('######## 正在写入文件中... ########')
    if (err){
      console.log("文件写入错误" + err)
    } else {
      console.log('成功写入' + path + '/index.html')
    }
  })
}

module.exports = function (path, content) {
  // 路径去参数
  path = path.match(/^[^\?]+\??/)[0].replace('?', '')
  fs.exists(process.cwd() + '/dist' + path, function (exists) {
    if (exists) {
      writefile(path, content)
    } else {
      mkdirp(process.cwd() + '/dist' + path, function (err) {
        if (err) console.log('路径创建错误' + err)
        else writefile(path, content)
      })
    }
  })
}
