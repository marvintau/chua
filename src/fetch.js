const outer = require('./outer');
const get = require('./get');

function getSuggs(list, colName) {
  return list.map(({[colName]:col}) => col)
}

function getAlterPath(data, aliases, indexColumn, origPath) {
  const alterPaths = outer(origPath.map(seg =>  aliases[seg] || [seg]));
  for (let path of alterPaths){
    let {record, siblings} = get(data, {path, indexColumn})
    if (record !== undefined){
      let code = 'INFO_ALTER_PATH',
          suggs = getSuggs(siblings, indexColumn);
      return { record, suggs, code };
    }
  }
  return {};
}

function fetchPath(expr, Sheets={}) {

  const {__PATH_ALIASES={}} = Sheets;

  if (typeof expr !== 'string') {
    return {code: 'FAIL_INVALID_PATH'};
  }

  const [name, body] = expr.split(':').map(elem => elem.trim());

  if (!(name && body)) {
    return {code: 'FAIL_INVALID_PATH'};
  } else if (Sheets[name] === undefined) {
    return {code: 'WARN_SHEET_NOT_FOUND'};
  }

  const {data, indexColumn} = Sheets[name];
  const path = body.split('/').map(elem => elem.trim());
  let {record, siblings} = get(data, {path, indexColumn});

  if (record === undefined){
    const {record, suggs, code} = getAlterPath(data, __PATH_ALIASES, indexColumn, path);
    if (record !== undefined) {
      return {record, suggs, code};
    }
  }

  const suggs = getSuggs(siblings, indexColumn);
  const code = 'NORM';
  return { record, suggs, code};
}

module.exports = fetchPath;