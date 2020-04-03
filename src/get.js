const {isInteger} = require('./util');

// get a record according to the path reprensented in index;
// 通过一个index构成的路径来寻找记录
const getByIndex = (array, {path, withList}) => {
  
  let siblings = array,
      record,
      list;
  
  (withList) && (list = []);

  for (let i = 0; i < path.length; i++){

    record = siblings[path[i]];
    
    if (record === undefined){
      throw {code: 'NOT_FOUND_REC_INDEX', from: 'getByIndex'};
    }

    if (withList){
      list.push(record);
    }
    
    siblings = record.__children || [];
  }

  return {record, siblings, list};
}

const getByColumn = (array, {path, column, withList}={}) => {

  let siblings = array,
      record,
      list;

  if (withList) {
    list = [];
  }
  
  for (let i = 0; i < path.length; i++){

    record = siblings.find(({[column]:colVal}) => colVal === path[i]);

    if (record === undefined){
      throw {code: 'NOT_FOUND_REC_COL', from: 'getByColumn'};
    }

    if (withList) {
      list.push(record);
    }
    
    if (i < path.length - 1){
      siblings = record.__children || [];
    }
  }

  return {record, siblings, list};

}

const get = (array, {path, column, withList=false}={}) => {

  if (path === undefined){
    throw {code: 'PATH_NOT_PROVIDED', from: 'get'}
  }

  if (Array.isArray(path) && path.every(isInteger)){
    return getByIndex(array, {path, withList});
  } else if (column !== undefined){
    return getByColumn(array, {path, column, withList});
  }
}

module.exports = get;