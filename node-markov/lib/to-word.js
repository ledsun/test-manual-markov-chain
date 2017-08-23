module.exports = function(tokens) {
  return tokens
    .map(w => w.surface_form)
    .join('-')
}
