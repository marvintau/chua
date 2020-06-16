const func = require('./funcs');
const parser = require("./expr.pegjs")

module.exports = (expr, {Sheets={}, vars={}, colKey}={}) => {
  Object.assign(parser, {func, Sheets, vars, colKey});
  try {
    return parser.parse(expr);
  } catch (error) {
    console.log(error);
    return {result: '表达式错误', code: 'FAIL_UNRECOGNIZED_EXPR', error}
  }
}