/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


// A helper function to check whether a number is valid for array index.
// 检查一个函数能否作为合法的数组索引
const isInteger = num =>
  typeof num === 'number' && (num % 1) === 0;

const trav = (array, func, dir='PRE') => {
  
  if (!['POST', 'PRE'].includes(dir)){
    throw {code:'INVLAID_TRAV_ORDER', from: 'trav'};
  }

  for (let i = 0; i < array.length; i++){
    let rec = array[i];
    (dir === 'PRE') && func(rec, i);
    (Array.isArray(rec.__children)) && trav(rec.__children, func, dir);
    (dir === 'POST') && func(rec, i);
  }
}

module.exports = {
  isPlainObject,
  isInteger,
  trav,
};