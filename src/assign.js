const add = require('./add');
const trav = require('./trav');
const fetchPath = require('./fetch-path');

const assignAllDescendants = (rec, key, value) => {
  if (rec.__children){
    trav(rec.__children, (rec) => {
      rec[key] && Object.assign(rec[key], value)
    })
  }
}

const assignAncestors = (rec, key) => {

  const {[key]:col, __children: subs} = rec;

  if ( col && subs ){

    // 由于后序遍历从叶子节点开始，我们首先遇到的节点是第一层含有categorized
    // 属性的节点，严格来说它们无法成为ancestor，因为它们子节点没有这个属性，
    // 所以直接跳过。对它的操作已经通过assignRecToSheet完成了。
    if (subs.every(({[key]:val}) => val === undefined)){
      return;
    }

    // 如果所有子层的result和code都是undefined，那么把它自己也赋值为
    // undefined。包含将原有的清空的操作。这也是唯一的可以解除disabled
    // 的方法。
    if (subs.every(({[key]:{result, code}}) => result === undefined && code === undefined)){
      Object.assign(rec[key], {
        result: undefined,
        code: undefined,
        disabled: undefined
      })
      return;
    }

    // 如果不满足以上条件，则意味着我们遇到了已经被分配的项目。已被分配的项目
    // 包含三种情况
    // 
    // 1. 它被分配是因为它的祖先节点被分配了
    // 2. 它就是刚刚被分配的节点
    // 3. 它是刚被分配节点的祖先节点
    // 
    // 而我们需要的仅是3. 能将3同1和2区分开的条件，是1和2的所有子节点的result
    // 都是'UPPER'，而3的子节点result只可能是数字或undefined

    if (subs.every(({[key]: {result}}) => result === undefined || (!isNaN(result) && result <= 100) )){

      let result = subs.reduce((acc, {[key]: {result}}) => {
        return acc + (result || 0)
      }, 0);
      
      let code = subs.every(({[key]: {code}}) => ['SUCC', undefined].includes(code))
      ? 'SUCC'
      : 'WARN_SUB_LEVEL';
  
      Object.assign(rec[key], {
        result: result / subs.length,
        code, 
        disabled: true
      });  
    }
  }
}

const assignRec = (sourceRec, destRec, key, expr) => {

  // 1. We analyzed the new expression and get the result, so set
  //    the current record immediately.
  const result = expr ? 100 : undefined;
  Object.assign(sourceRec[key], { expr, result, code});

  // 2. check if the destination record exists. If so, skip assigning
  if (destRec === undefined){
    console.log('target record not exists');
  } else if (destRec.__children.includes(rec)){
    console.log('source record has been assigned');
  } else {
    add(destRec.__children, rec);
  }
}

const assignSheet = (sourceSheet, sourceRec, key, expr, Sheets) => {

  // 1. We analyzed the new expression and get the result, so set
  //    the current record immediately
  const {code, record:destRec} = fetchPath(expr, Sheets);
  assignRec(sourceRec, destRec, key, expr);

  // 2. Compare the new expression with old one. If the orginal
  //    expression is empty, and the new one is not, then do the
  //    assginAllDescendants as before.
  const isNewExprEmpty = !expr || expr.length === 0;
  const options = {
    result: !isNewExprEmpty && 'UPPER',
    disabled: !isNewExprEmpty,
    code,
    expr
  }

  assignAllDescendants(rec, key, options);
  trav(sourceSheet, assignAncestors)
}

module.exports = assignSheet;