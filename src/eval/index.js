const get = require('../get');
const outer = require('../outer');
const parser = require("./expr.pegjs")

module.exports = (expr, vars, {func={}, Sheets={}, self={}}={}) => {
  Object.assign(parser, {func, Sheets, get, self, outer, vars});
  try {
    return parser.parse(expr);
  } catch (error) {
    return {result: '表达式错误', code: 'FAIL_UNRECOGNIZED_EXPR', error}
  }
}