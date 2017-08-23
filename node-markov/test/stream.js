const test = require('tape')
const markov = require('../')
const EventEmitter = require('events').EventEmitter

test('stream', function (t) {
  t.plan(3)

  const m = markov(1)
  const to = setTimeout(function () {
    t.fail('never finished')
  }, 5000)

  const em = new EventEmitter()
  m.seed(em, function () {
    clearTimeout(to)

    const counts = {}
    for (let i = 0; i < 100; i++) {
      const w = m.next('the')
      counts[w.key] = (counts[w.key] || 0) + 1
    }

    t.deepEqual(Object.keys(counts).sort(), [ 'cat', 'cow' ])
    t.ok(counts.cat >= 40 && counts.cat <= 60)
    t.ok(counts.cow >= 40 && counts.cow <= 60)
  })

  setTimeout(function () {
    em.emit('data', 'The cow says')
  }, 100)

  setTimeout(function () {
    em.emit('data', 'moo.\nThe ')
  }, 150)

  setTimeout(function () {
    em.emit('data', 'cat says meow.\n')
    em.emit('end')
  }, 200)
})
