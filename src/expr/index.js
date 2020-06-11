const get = require('../get');
const outer = require('../outer');
const parser = require("./expr.pegjs")

module.exports = (expr, {func={}, Sheets={}, vars={}}={}) => {
  Object.assign(parser, {func, Sheets, vars});
  try {
    return parser.parse(expr);
  } catch (error) {
    return {result: '表达式错误', code: 'FAIL_UNRECOGNIZED_EXPR', error}
  }
}