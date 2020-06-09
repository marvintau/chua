const get = require('../get');
const outer = require('../outer');
const parser = require("./expr.pegjs")

module.exports = (expr, {func={}, Sheets={}, self={}}={}) => {
  Object.assign(parser, {func, Sheets, get, self, outer});
  try {
    return parser.parse(expr);
  } catch (e) {
    console.log(e, 'outer');
    return {result: '表达式错误', code: 'FAIL'}
  }
}