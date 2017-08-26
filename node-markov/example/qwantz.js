const fs = require('fs')
const path = require('path')

const markov = require('../index.js')
const m = markov(3)

// var s = fs.createReadStream(__dirname + '/qwantz.txt');
const s = fs.createReadStream(path.join(__dirname, '/../../../grapheditor.wiki/User-Acceptance-Test.md'))
m.seed(s, (db, tokenizer) => {
  const stdin = process.openStdin()

  const graph = {
    // nodes: {},
    edges: []
  }
  for (const [clause, tags] of Object.entries(db)) {
    // graph.nodes[encodeURIComponent(clause)] = {text: Object.keys(tags.words)[0]}
    graph.edges.push({
      subject: clause,
      object: Object.keys(tags.next)[0]
    })
  }
  // graph.focus = Object.keys(graph.nodes)[0]
  console.log('seed is prepared.', JSON.stringify(graph, null, 2))

  stdin.on('data', function (line) {
    m.respond(line.toString().trim(), null, tokenizer)
      .then((res) => {
        res.forEach((statement) => console.log(statement.join(' ')))
      })
  })
})
