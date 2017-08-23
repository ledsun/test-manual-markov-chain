const cleanToken = require('./clean-token')
const clean = require('./clean')

module.exports = function toCleanWord(tokens) {
  return clean(
    tokens
      .map(cleanToken)
      .join('')
  )
}
