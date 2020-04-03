const {trav} = require('./util');

const pathify = (array) => {

  const func = (rec, index) => {
    if (rec.__path === undefined){
      Object.defineProperty(rec, '__path', {value: [index]})
    }

    const children = rec.__children;
    
    if (children === undefined){
      return
    }
    
    for (let i = 0; i < children.length; i++){
      if (children[i].__path === undefined){
        Object.defineProperty(children[i], '__path', {value: [...rec.__path, i]})
      }
    }
  }

  trav(array, func, 'PRE');
}

module.exports = pathify;