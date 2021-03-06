const isInteger = num =>
  typeof num === 'number' && (num % 1) === 0;

// get a record according to the path reprensented in index;
// 通过一个index构成的路径来寻找记录
const getByIndex = (array, {path, withList}) => {
  
  let siblings = array,
      record,
      list;
  
  // const hash = path.toString();

  (withList) && (list = []);

  for (let i = 0, len = path.length; i < len; i++){

    record = siblings[path[i]];
    
    if (record === undefined){ break }

    (withList) && list.push(record);
    
    (i < path.length - 1) && (siblings = record.__children || []);
  }

  return {record, siblings, list};
}

const getByColumn = (array, {path, indexColumn, withList}={}) => {

  let siblings = array,
      record,
      list;

  (withList) && (list = []);
  
  for (let i = 0, len = path.length; i < len; i++){

    record = siblings.find(({[indexColumn]:colVal}) => colVal === path[i]);

    if (record === undefined){ break; }

    if (withList) {
      list.push(record);
    }
    
    (i < path.length - 1) && (siblings = record.__children || []);
  }

  return {record, siblings, list};

}

const get = (array, {path, indexColumn, withList=false}={}) => {

  if (path === undefined){
    throw {code: 'PATH_NOT_PROVIDED', from: 'get'}
  }
  // console.log(path, indexColumn, 'get');
  let res;
  if (Array.isArray(path) && path.every(isInteger)){
    res = getByIndex(array, {path, withList});
  } else if (indexColumn !== undefined){
    res = getByColumn(array, {path, indexColumn, withList});
  } else {
    throw {code: 'INVALID_PATH', from: 'get', path};
  }

  return res;
}

module.exports = get;