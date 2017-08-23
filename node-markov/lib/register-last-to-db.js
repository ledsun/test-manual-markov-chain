const Hash = require('hashish')
const toCleanWord = require('./to-clean-word')
const toWord = require('./to-word')

module.exports = function(db, tokens, nextTokens) {
  const cnext = toCleanWord(nextTokens)
  const next = toWord(nextTokens)
  const cword = toCleanWord(tokens)

  if (!Hash.has(db, cnext)) {
    db[cnext] = {
      count: 1,
      words: {},
      next: {
        '': 0
      },
      prev: {}
    }
  }

  const n = db[cnext]
  n.words[next] = (Hash.has(n.words, next) ? n.words[next] : 0) + 1
  n.prev[cword] = (Hash.has(n.prev, cword) ? n.prev[cword] : 0) + 1
  n.next[''] = (n.next[''] || 0) + 1
}
