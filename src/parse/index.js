const get = require('../get');
const parser = require("./expr.pegjs")

module.exports = (expr, {func={}, tables={}}={}) => {
  Object.assign(parser, {func, tables, get});
  return parser.parse(expr);
}