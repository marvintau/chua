const {trav} = require('./util');

const pathify = (array) => {

  const func = (rec, index) => {
    if (rec.__path === undefined){
      Object.defineProperty(rec, '__path', {value: [index], enumerable: false, configurable: true})
    }

    const children = rec.__children;
    
    if (children === undefined){
      return
    }
    
    for (let i = 0; i < children.length; i++){
      if (children[i].__path === undefined){
        Object.defineProperty(children[i], '__path', {value: [...rec.__path, i], enumerable: false, configurable: true})
      }
    }
  }

  trav(array, func, 'PRE');

  return [...array];
}

module.exports = pathify;