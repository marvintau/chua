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

const del = (array, {atIndex, num, path=[], indexColumn}={}) => {
  if (path.length === 0){
    delArray(array, atIndex, num);
  } else {
    const {record} = get(array, {path, indexColumn});
    
    delArray(record.__children || [], atIndex, num);
  }

  return [...array];
}

module.exports = del;