const get = require('../get');
const parser = require("./expr.pegjs")

module.exports = (expr, {func={}, data={}, column="ccode_name"}={}) => {
  Object.assign(parser, {func, data, column, get});
  return parser.parse(expr);
}