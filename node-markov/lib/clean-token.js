module.exports = function(token) {
  return token.basic_form === '*' ? token.surface_form : token.basic_form
}
