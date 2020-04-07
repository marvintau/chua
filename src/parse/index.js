const get = require('../get');
const parser = require("./expr.pegjs")

module.exports = (expr, {func={}, tables={}, self={}}={}) => {
  Object.assign(parser, {func, tables, get, self});
  try {
    return parser.parse(expr);
  } catch {
    return {result: '表达式错误', code: 'WARN'}
  }
}