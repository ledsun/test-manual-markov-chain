const test = require('tape')
const markov = require('../')

test('limit', function (t) {
  const to = setTimeout(function () {
    t.fail('never finished')
  }, 5000)

  const m = markov(1)

  const these = 'the THE tHe ThE thE The the THE The tHE the the'
  m.seed(these, function () {
    clearTimeout(to)

    const counts = {}
    for (let i = 0; i < 100; i++) {
      const lim = Math.ceil(Math.random() * 10)
      const res = m.respond('the', lim)
      t.ok(res.length <= lim)

      res.forEach(function (r) {
        t.ok(these.split(' ').indexOf(r) >= 0)
        counts[r] = (counts[r] || 0) + 1
      })
    }

    t.end()
  })
})
