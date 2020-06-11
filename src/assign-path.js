
const add = require('./add');
const get = require('./get');
const trav = require('./trav');
const fetchPath = require('./fetch-path');

const assignDescendants = (sourceRec, options) => {
  sourceRec.__assigned_ances = [];

  const scanDescendant = (rec) => {
      
    if (rec.__assigned_ances === undefined) {
      rec.__assigned_ances = [];
    }
    rec.__assigned_ances.push(sourceRec);
    
    if (options){
      Object.assign(rec, options);
    }
  }

  if (sourceRec.__children){
    trav(sourceRec.__children, scanDescendant);
  }
}

const assignAncestors = (sourceSheet, sourceRec, options) => {
  sourceRec.__assigned_desc = [];

  const {list} = get(sourceSheet, {path: sourceRec.__path, withList: true});
  list.pop();
  for (let rec of list) {
    if (rec.__assigned_desc === undefined) {
      rec.__assigned_desc = [];
    }
    rec.__assigned_desc.push(sourceRec);
    Object.assign(rec, options);
  }
}

const assignRec = (sourceRec, destRec) => {

  if (sourceRec.__assigned_desc.length > 0) {
    throw {code: 'DEAD_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if (sourceRec.__assigned_ances.length > 0) {
    throw {code: 'DEAD_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if (destRec === undefined){
    console.log('target record not exists');
  } else if (destRec.__children && destRec.__children.includes(sourceRec)){
    console.log('source record has been assigned');
  } else {
    if (destRec.__children === undefined) {
      destRec.__children = [];
    }
    add(destRec.__children, sourceRec);
  }
}

const assignSheet = (path, sourceRec, sourceSheet, Sheets, {ancestorOptions, descendantOptions}={}) => {

  const {record:destRec} = fetchPath(path, Sheets);

  trav(sourceSheet, (rec) => {
    const {__assigned_ances: ances = [], __assigned_desc: desc = []} = rec;
    ances.splice(ances.findIndex(rec => rec === sourceRec), 1);
    desc.splice(desc.findIndex(rec => rec === sourceRec), 1);
  })

  // Note the sequence.
  // WHen assigning the ancestors, we have traversed the whole table
  assignAncestors(sourceSheet, sourceRec, ancestorOptions);
  assignDescendants(sourceRec, descendantOptions);
  assignRec(sourceRec, destRec);

}

module.exports = assignSheet;