const test = require('tape')
const markov = require('../')

test('has', function (t) {
  const to = setTimeout(function () {
    t.fail('never finished')
  }, 5000)

  const m = markov(1)

  const these = 'constructor toLocaleString valueOf __defineGetter__'
  m.seed(these, function () {
    clearTimeout(to)

    const counts = {}
    for (let i = 0; i < 100; i++) {
      const res = m.respond('the', 100)
      t.ok(res.length < 100)

      res.forEach(function (r) {
        t.ok(these.split(' ').indexOf(r) >= 0)
        counts[r] = (counts[r] || 0) + 1
      })
    }

    t.deepEqual(
      Object.keys(counts).sort(),
      these.split(' ').sort()
    )

    t.end()
  })
})
