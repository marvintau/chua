const {isInteger, isPlainObject} = require('./util');
const get = require('./get');

const addArray = (array, recs, atIndex) => {

  if (Array.isArray(recs) && recs.every(isPlainObject)) {
    isInteger(atIndex)
    ? array.splice(atIndex+1, 0, ...recs)
    : array.push(...recs);
  } else if (isPlainObject(recs)){
    isInteger(atIndex)
    ? array.splice(atIndex+1, 0, recs)
    : array.push(recs);
  } else {
    throw {code: 'INVALID_ADDING_REC', from: 'add'}
  }

  return [...array];
}

const dupRec = (rec, init=true) => {
  let newRec = {...rec};
  newRec = JSON.parse(JSON.stringify(newRec));
  console.log(newRec, 'added');
  if (init){
    for (let key in newRec) switch (typeof newRec[key]){
      case 'number':
        newRec[key] = 0; break;
      case 'string':
        newRec[key] = ""; break;
      case 'undefined':
        newRec[key] = ''; break;
      default:
        newRec[key] = {}; break;
    }
  }

  return newRec;
}

/**
 * Add
 * ---------
 * 向树组中的给定位置添加一条或若干条记录。
 * 
 * @param {[]} array array to be operated
 * @param {[]|{}} recs record(s) to be added
 */
const add = (array, recs, {path=[], atIndex}={}) => {
  if (path.length === 0){
    addArray(array, recs, atIndex, path);
  } else {

    if (path.some(i => !isInteger(i))) {
      throw({code: 'INDEX_COLUMN_NOT_SUPPORTED', from: 'add'});
    }

    const {record} = get(array, {path});

    if (record.__children === undefined){
      Object.defineProperty(record, '__children', {
        value: []
      }); // not enumerable.
    }

    // console.log(record, 'before add', record.__children.length)

    if (recs === undefined){
      recs = dupRec(record)
    }

    addArray(record.__children, recs, atIndex);
    // console.log(recs, 'after added', record.__children.length);
  }
}

module.exports = add;