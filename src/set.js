const {isPlainObject} = require('./util');
const get = require('./get');

const set = (array, kvs, {path=[], indexColumn}) => {
  if (path.length === 0){
    throw {code: 'EMPTY_PATH_WHEN_SET', from: 'set'}
  } else if (isPlainObject(kvs)){
    const {record} = get(array, {path, indexColumn});
    console.log(record, kvs, 'setting');
    Object.assign(record, kvs);
  }
}

module.exports = set;