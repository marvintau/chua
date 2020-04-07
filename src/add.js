const {isInteger, isPlainObject} = require('./util');
const get = require('./get');

const addArray = (array, recs, atIndex, basePath) => {

  console.log(recs, 'addArray');

  if (Array.isArray(recs) && recs.every(isPlainObject)) {
    isInteger(atIndex)
    ? array.splice(atIndex, 0, ...recs)
    : array.push(...recs);
  } else if (isPlainObject(recs)){
    console.log('here');
    isInteger(atIndex)
    ? array.splice(atIndex, 0, recs)
    : array.push(recs);
  } else {
    throw {code: 'INVALID_ADDING_REC', from: 'add'}
  }

  for (let i = 0; i < array.length; i++){
    Object.defineProperty(array[i], '__path', {
      value: [...basePath, (isInteger(atIndex) ? atIndex : 0) + i],
      enumerable: false
    })
  }

  return [...array];
}

const dupRec = (rec, init=true) => {
  let newRec = {...rec};
  newRec = JSON.parse(JSON.stringify(newRec));
  
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
const add = (array, recs, {path=[], indexColumn, atIndex}={}) => {
  if (path.length === 0){
    return addArray(array, recs);
  } else {
    const {record} = get(array, {path, indexColumn});

    if (record.__children === undefined){
      Object.defineProperty(record, '__children', {
        value: []
      }); // not enumerable.
    }

    console.log(record, 'before add', record.__children.length)

    if (recs === undefined){
      recs = dupRec(record)
    }

    addArray(record.__children, recs, atIndex, path);

    console.log(recs, 'after added', record.__children.length);
  }
}

module.exports = add;