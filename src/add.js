const {isInteger, isPlainObject} = require('./util');

const trav = require('./trav');
const get = require('./get');

const setParent = (recs, parent) => {
  if (Array.isArray(recs) && recs.every(isPlainObject)) {
    for (let rec of recs) {
      rec.__parent = parent;
    }
  } else if (isPlainObject(recs)) {
    recs.__parent = parent;
  } else {
    throw {code: 'INVALID_REC', from: 'add'}
  }
}

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
  let {__path, __children, ...newRec} = rec;
  newRec = JSON.parse(JSON.stringify(newRec));
  console.log(newRec, 'added');
  if (init){
    for (let key in newRec) if (!key.startsWith('__')) switch (typeof newRec[key]){
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
 * 向级联记录中的给定位置添加一条或若干条记录。
 * 
 * 需要注意的是，所添加的记录未必会有合适的__path属性。如果您需要保证操作完成后
 * 所有的记录都拥有__path属性，那么应该在add或执行批量add后进行一个trav操作。
 * 
 * 然而，由于trav操作会重新生成__path属性，因此如果您所添加的记录已经拥有了__path
 * 并且打算保留它，那么就避免用trav。
 * 
 * @param {[]} array array to be operated
 * @param {?[]|{}} recs record(s) to be added
 * @param {{path:[], atIndex:number}} options indicating where to insert the record(s), where
 *    - `path`: the path to some specific record
 *    - `atIndex`: the index of the children of the record to be inserted to
 * 
 * @returns undefined
 * 
 * @example
 * const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
 * add(array, {num:2, name:'bsd'});
 * console.log(array);
 * 
 * @example
 * const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
 * add(array, {num:2, name:'bsd'}, {path=[0]});
 * console.log(array);
 */
const add = (array, recs, {path=[], atIndex}={}) => {
  if (path.length === 0){
    addArray(array, recs, atIndex);
  } else {

    if (path.some(i => !isInteger(i))) {
      throw({code: 'INDEX_COLUMN_NOT_SUPPORTED', from: 'add'});
    }

    const {record} = get(array, {path});

    if (record.__children === undefined){
      record.__children = [];
    }

    if (recs === undefined){
      recs = dupRec(record)
    }

    addArray(record.__children, recs, atIndex);
    setParent(recs, record);
  }
}

module.exports = add;