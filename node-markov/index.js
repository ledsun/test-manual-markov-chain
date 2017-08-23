const deck = require('deck')
const Lazy = require('lazy')
const Hash = require('hashish')

const kuromojiParser = require('./lib/kuromoji-parser')
const clean = require('./lib/clean')
const registerLastToDB = require('./lib/register-last-to-db')
const registerLinksToDB = require('./lib/register-links-to-db')

module.exports = function(order) {
  if (!order) order = 2
  const db = {}
  const self = {}

  self.seed = function(seed, cb) {
    kuromojiParser.init()
      .then((tokenizer) => {
        Lazy(seed)
          .lines
          .map((seed) => prepareDB(seed, tokenizer, order, db))
          .join((lineProcesses) => {
            Promise.all(lineProcesses)
              .then(() => cb(db, tokenizer))
          })

        seed.on('error', cb)
      })
  }

  self.search = function(text, tokenizer) {
    return kuromojiParser
      .parse(text, tokenizer)
      .then((words) => {
        const groups = {}
        for (let i = 0; i < words.length; i += order) {
          const word = clean(words.slice(i, i + order)
            .join(''))
          if (Hash.has(db, word)) groups[word] = db[word].count
        }

        return Promise.resolve(deck.pick(groups))
      })
  }

  self.pick = function() {
    return deck.pick(Object.keys(db))
  }

  self.next = function(cur) {
    if (!cur || !db[cur]) return undefined

    const next = deck.pick(db[cur].next)
    return next && {
      key: next,
      word: deck.pick(db[next].words)
    } || undefined
  }

  self.prev = function(cur) {
    if (!cur || !db[cur]) return undefined

    const prev = deck.pick(db[cur].prev)
    return prev && {
      key: prev,
      word: deck.pick(db[prev].words)
    } || undefined
  }

  self.forward = function(cur, limit) {
    const res = []
    while (cur && !limit || res.length < limit) {
      const next = self.next(cur)
      if (!next) break
      cur = next.key
      res.push(next.word)
    }

    return res
  }

  self.backward = function(cur, limit) {
    const res = []
    while (cur && !limit || res.length < limit) {
      const prev = self.prev(cur)
      if (!prev) break
      cur = prev.key
      res.unshift(prev.word)
    }

    return res
  }

  self.fill = function(cur, limit) {
    const res = [deck.pick(db[cur].words)]
    if (!res[0]) return []
    if (limit && res.length >= limit) return res

    let pcur = cur
    let ncur = cur

    while (pcur || ncur) {
      if (pcur) {
        const prev = self.prev(pcur)
        pcur = null
        if (prev) {
          pcur = prev.key
          res.unshift(prev.word)
          if (limit && res.length >= limit) break
        }
      }

      if (ncur) {
        const next = self.next(ncur)
        ncur = null
        if (next) {
          ncur = next.key
          res.push(next.word)
          if (limit && res.length >= limit) break
        }
      }
    }

    return res
  }

  self.respond = function(text, limit, tokenizer) {
    // console.log('respond', text, limit)

    return self
      .search(text, tokenizer)
      .then((cur) => {
        let base
        if (cur) {
          base = cur
        } else {
          base = self.pick()

          console.log('>', base)
        }

        return Promise.resolve([...new Array(5)].map(() => self.fill(base, limit)))
      })
  }

  self.word = function(cur) {
    return db[cur] && deck.pick(db[cur].words)
  }

  return self
}

function prepareDB(seed, tokenizer, order, db) {
  let text = (Buffer.isBuffer(seed) ? seed.toString() : seed)

  if (!text) return Promise.resolve()
  if (!text.startsWith('1. ')) return Promise.resolve()
  text = text
    .substr(3) // 1.を捨てる
    .replace(/ *\([^)]*\) */g, '') // Remove text between brackets
    .replace(/ *（[^)]*） */g, '') // Remove text between brackets
    .replace(/`/g, '') // Remove text between brackets

  return kuromojiParser
    .parse(text, tokenizer)
    .then((tokens) => {
      const links = tokens
        .map((c) => {
          if(c.surface_form === 'D'){
            console.log(c)
          }else{
            // console.log(c)
          }
          return c
        })
        .reduce((links, _, i, words) => toClause(links, _, i, words, order), [])

      Promise.resolve(registerDB(db, links))
    })
}

function toClause(links, _, index, words) {
  const checkedWords = links.reduce((a, b) => a.concat(b), []).length

  if(index === 0) {
    return links
  }

  // console.log(checkedWords, index, words.length, words[index].surface_form)

  // 自立語まで取ったそこに進むまでは無視
  // 自立語の前まで切りたいので、indexの方が大きい時はチェックする
  if(checkedWords < index){
    const jiritsuOffset = words.slice(index).findIndex((t) => isJiritsu(t))

    // 後ろに自立語がないので、末尾まで文節とする
    if(jiritsuOffset === -1){
      links.push(words.slice(index - 1))
    } else {
      const jiritshPositional = index + jiritsuOffset

      // 文字が取れれば
      if(jiritshPositional >= checkedWords){
        links.push(words.slice(checkedWords, jiritshPositional))
      } else if(jiritshPositional === checkedWords - 1) {
        // 0文字しか取れないので無視
        console.log(words[jiritshPositional])

        // 後ろに自立語がないので、末尾まで文節とする
        if(words.slice(jiritshPositional + 1).findIndex(isJiritsu) === -1){
          links.push(words.slice(jiritshPositional))
        }
      } else {
        console.log(checkedWords, jiritshPositional)
      }
    }
  } else if(checkedWords === words.length - 1) {
    // console.log(checkedWords, words.length)
    links.push(words.slice(checkedWords))
  }

  return links
}

function isJiritsu(token) {
  if(token.pos === '名詞'){
    if (token.pos_detail_1 === '非自立'){
      return false
    } else {
      return true
    }
  }

  if(token.pos === '動詞' || token.pos === '形容詞'){
    if (token.pos_detail_1 === '自立'){
      return true
    } else {
      return false
    }
  }

  if(token.pos === '連体詞' || token.pos === '副詞' || token.pos === '接続詞' || token.pos === '接頭詞') {
    return true
  }

  if(token.pos === '助詞' || token.pos === '助動詞') {
    return false
  }

  if(token.pos === '記号' || token.pos_detail_1 === '空白') {
    return false
  }


  return true
}

// order数で配列を区切る
// うしろから
// ex order=3: [1, 2, 3, 4, 5] => [[1, 2],[3, 4, 5]]
function toLinks(links, _, index, words, order) {
  if ((words.length - index) % order === 0) {
    links.push(words.slice(index, index  + order))
  }

  if (index === (words.length % order)) {
    links.push(words.slice(0 ,index))
  }

  return links
}

// 副詞や句点の後ろで区切る
function toLinks2(links, _, index, words) {
  if(links.reduce((a, b) => a.concat(b), []).length <= index){
    const hogePositional = words.slice(index).findIndex((t) => t.pos_detail_1 === '数')
    if(hogePositional !== -1){
      // `助詞、`なことが多いので句点を先に探す
      links.push(words.slice(index, index + hogePositional + 1))
    } else {
      const postPositional = words.slice(index).findIndex((t) => t.pos === '助詞' || t.pos === '助動詞')
      if(postPositional !== -1){
        links.push(words.slice(index, index + postPositional + 1))
      } else {
        links.push(words.slice(index))
      }
    }
  }

  return links
}

function registerDB(db, links) {
  if (links.length <= 1) {
    return
  }

  const {
    tokens,
    nextTokens
  } = registerLinksToDB(db, links)

  registerLastToDB(db, tokens, nextTokens)

  process.stdout.write('.')
}
