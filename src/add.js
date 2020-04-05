const {isInteger, isPlainObject} = require('./util');
const get = require('./get');

const addArray = (array, recs, atIndex) => {
  if (Array.isArray(recs) && recs.every(isPlainObject)) {
    isInteger(atIndex)
    ? array.splice(atIndex, ...recs)
    : array.push(...recs);
  } else if (isPlainObject(recs)){
    isInteger(atIndex)
    ? array.splice(atIndex, recs)
    : array.push(recs);
  } else {
    throw {code: 'INVALID_REC', from: 'add'}
  }

  return [...array];
}

/**
 * Add
 * ---------
 * 向树组中的给定位置添加一条或若干条记录。
 * 
 * @param {[]} array array to be operated
 * @param {[]|{}} recs record(s) to be added
 */
const add = (array, recs, {path=[], column, atIndex}={}) => {
  if (path.length === 0){
    return addArray(array, recs);
  } else {
    const {record} = get(array, {path, column});

    if (record.__children === undefined){
      Object.defineProperty(record, '__children', {
        value: []
      }); // not enumerable.
    }

    return addArray(record.__children, recs, atIndex);
  }
}

module.exports = add;