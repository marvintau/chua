const {isInteger} = require('./util');
const get = require('./get');

const delArray = (array, atIndex, num) => {
  if (isInteger(atIndex)) {
    array.splice(atIndex, num);
  } else if (isInteger(num)){
    array.splice(array.length - num, num);
  } else {
    array.pop();
  }
}

/**
 * del
 * ---------
 * 按给定位置从级联记录中删去记录（及其子层记录）。
 * 
 * @param {[]} array array to be operated
 * @param {{path:[], atIndex:number}} options indicating where to insert the record(s), where
 *    - `path`: the path to some specific record
 *    - `atIndex`: the index of the children of the record to be inserted to
 * 
 * @returns undefined
 * 
 * @example
 * const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
 * del(array); // same as array.pop();
 * console.log(array);
 * 
 * @example
 * const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
 * del(array, {path=[0], atIndex=0, num=2});
 * console.log(array);
 */

const del = (array, {atIndex, num=1, path=[]}={}) => {
  if (path.length === 0){
    delArray(array, atIndex, num);
  } else {
    const {record} = get(array, {path, indexColumn});
    console.log(record, atIndex, 'before delete');
    delArray(record.__children || [], atIndex, num);
  }
}

module.exports = del;