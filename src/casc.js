const group = require('./group');

function casc(array, {cascCol, genFunc, matchFunc}={}) {

  if (cascCol === undefined){
    if (genFunc === undefined || matchFunc === undefined){
      throw {code: 'KEY_FUNC_NOT_SPECIFIEDD', from: 'casc'};
    }
  } else {
    if (genFunc === undefined){
      genFunc = ({[cascCol]:col}) => col.length;
    }
    if (matchFunc === undefined) {
      matchFunc = ({[cascCol]:parent}, {[cascCol]:child}) => child.startsWith(parent);
    }
  }

  // grip使用了genFunc，将列表分为几代（Generation）
  // gens是分代的结果，分代结果应该是祖先在前，后继在后。
  const sorted = sort(array, genFunc);
  const gens = Object.values(group(sorted, genFunc));

  // 每相邻的两代之间两两比较，为所有子辈找对应的父辈。如果没有找到父辈的孩子会被弃掉。
  let children;
  for (children = gens.pop(); gens.length > 0; children = gens.pop()) {
    let parents = gens.pop();

    // 如果记录没有children这个属性则清空
    for (let i = 0; i < parents.length; i++){
      parents[i].__children = [];
    }
    
    // 在两代中间进行匹配
    while (children.length > 0) {
      let child = children.pop();
      for (let i = 0; i < parents.length; i++){
        let parent = parents[i];
          
        if (matchFunc(parent, child)) try {
          parent.__children.push(child)
        }catch{
          throw Error('found')
        }
      }
    }

    gens.push(parents);
  }
  // 返回祖先一代。
  return children;
}

module.exports = casc;