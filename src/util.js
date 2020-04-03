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
  isInteger,
  trav,
};