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

    if (rec) {
      Object.assign(rec, {__path: currPath});
      
      (dir === 'PRE') && func(rec, currPath);
      if (Array.isArray(rec.__children)){
        trav(rec.__children, func, dir, currPath);
      }
      (dir === 'POST') && func(rec, currPath);
    }
  }
}

module.exports = trav;