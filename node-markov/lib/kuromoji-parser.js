const util = require('util')
const kuromoji = require('kuromoji')

// この builder が辞書やら何やらをみて、形態素解析機を造ってくれるオブジェクトです。
const builder = kuromoji.builder({
  // ここで辞書があるパスを指定します。今回は kuromoji.js 標準の辞書があるディレクトリを指定
  dicPath: 'node_modules/kuromoji/dict'
})

function init () {
  return util.promisify(builder.build.bind(builder))()
}

function parse (line, tokenizer) {
  return new Promise((resolve, reject) => {
    try {
      resolve(tokenizer.tokenize(line))
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  init,
  parse
}
