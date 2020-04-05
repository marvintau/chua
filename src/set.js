const {isPlainObject} = require('./util');
const get = require('./get');

const set = (array, kvs, path=[], col) => {
  if (path.length === 0){
    throw {code: 'EMPTY_PATH_WHEN_SET', from: 'set'}
  } else if (isPlainObject(kvs)){
    const rec = get(array, path, col);
    Object.assign(rec, kvs);
  }
}

module.exports = set;