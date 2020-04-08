function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

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




// 遍历一个array，并对所有的record执行func操作。
// 需要注意，我们一般认为rec的__children属性都是non-enumerable的，但是如果
// 一个表是从json里读出来的，那么所有属性都会是enumerable，因此我们在遍历时
// 会检查__children是否是enumerable，如是则重设为否。

// 如果不提供func，那么func的默认值为空，trav的工作就是重设一次所有array中
// record的__path属性

const trav = (array, func= e=>e, dir='PRE', path=[]) => {
  
  if (!['POST', 'PRE'].includes(dir)){
    throw {code:'INVLAID_TRAV_ORDER', from: 'trav'};
  }

  for (let i = 0; i < array.length; i++){
    const rec = array[i];
    const currPath = path.concat(i);

    Object.defineProperty(rec, '__path', { value: currPath, configurable: true});

    (dir === 'PRE') && func(rec, currPath);
    if (Array.isArray(rec.__children)){
      if (rec.propertyIsEnumerable('__children')){
        Object.defineProperty(rec, '__children', {value: rec.__children, enumerable: false});
      }
      trav(rec.__children, func, dir, currPath);
    }
    (dir === 'POST') && func(rec, currPath);
  }
}

module.exports = {
  isPlainObject,
  isInteger,
  trav,
};