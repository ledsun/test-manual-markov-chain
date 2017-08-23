const Hash = require('hashish')
const toWord = require('./to-word')
const toCleanWord = require('./to-clean-word')
const clean = require('./clean')
const cleanToken = require('./clean-token')

module.exports = function(db, links) {
  let tokens
  let nextTokens

  for (let i = 1; i < links.length; i++) {
    tokens = links[i - 1]
    const word = toWord(tokens)
    const cword = toCleanWord(tokens)

    nextTokens = links[i]
    const cnext = toCleanWord(nextTokens)

    const node = Hash.has(db, cword) ?
      db[cword] : {
        count: 0,
        words: {},
        next: {},
        prev: {}
      }

    db[cword] = node

    node.count++
    node.words[word] = (
      Hash.has(node.words, word) ? node.words[word] : 0
    ) + 1
    node.next[cnext] = (
      Hash.has(node.next, cnext) ? node.next[cnext] : 0
    ) + 1
    if (i > 1) {
      const prev = clean(links[i - 2].map(cleanToken)
        .join(''))
      node.prev[prev] = (
        Hash.has(node.prev, prev) ? node.prev[prev] : 0
      ) + 1
    } else {
      node.prev[''] = (node.prev[''] || 0) + 1
    }
  }

  return {
    tokens,
    nextTokens
  }
}
