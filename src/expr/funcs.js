
function sumCode(children, fieldName='ref'){
  const result = children.some(({[fieldName]:col}) => col && col.code && col.code !== 'NORM') ? 'WARN' : 'NORM';
  return result;
}

function sumResult(children, fieldName='ref'){
  const result = children
    .reduce((acc, {[fieldName]:col}) => {
      console.log('col', fieldName, col);
      if (col === undefined) {
        return acc
      } else if (typeof col === 'number') {
        return acc + col;
      } else if (col.result && typeof col.result === 'number') {
        return acc + col.result;
      } else return 0;
    }, 0);
  
    return parseFloat(result.toFixed(2));
}

module.exports = {
  NONE(){
    return {result: undefined, code: 'NONE'}
  },

  SUMSUB(rec, fieldName='ref'){
    const {__children} = rec;

    if(__children !== undefined){
      const code = sumCode(__children, fieldName);
      const result = sumResult(__children, fieldName);
      return { code, result }
    } else {
      return {code: 'NORM', result: 0};
    }
  },
  SUB(rec, fieldName='ref', index){
    if (rec.__children && rec.__children.length > 0){
      const {result, code} = rec.__children[index][fieldName];
      return {result, code};
    } else {
      return {result: 0, code: 'WARN'};
    }
  }
};
