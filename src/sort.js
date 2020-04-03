const {trav} = require('./util');

const sort = (array, key) => {

  const labelFunc = key.constructor === Function
  ? (rec) => key(rec) 
  : (rec) => rec[key]

  const sortFunc = (rec) => {
    if (rec.__children === undefined){
      return
    }
    rec.__children.sort((prev, next) => {
      const prevVal = labelFunc(prev),
            nextVal = labelFunc(next);

      return prevVal > nextVal ? 1
      : prevVal < nextVal ? -1
      : 0
    })
  }

  trav(array, sortFunc, 'POST');

  return [...array];
}

module.exports = sort;