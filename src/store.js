
const get = require('./get');
const trav = require('./trav');
const fetch = require('./fetch');

const addUndo = (list, rec, {undo=false}={}) => {
  if (undo) {
    const index = list.findIndex(r => r === rec);
    if (index !== -1){
      list.splice(index, 1);
    }
  } else {
    list.push(rec);
  }
}

const assignDescendants = (sourceRec, {undo=false}={}) => {
  sourceRec.__assigned_ances = [];

  const scanDescendant = (rec) => {
      
    if (rec.__assigned_ances === undefined) {
      rec.__assigned_ances = [];
    }

    addUndo(rec.__assigned_ances, sourceRec, {undo})
  }

  if (sourceRec.__children){
    trav(sourceRec.__children, scanDescendant);
  }
}

const assignAncestors = (sourceSheet, sourceRec, {undo=false}={}) => {
  sourceRec.__assigned_desc = [];

  const {list} = get(sourceSheet, {path: sourceRec.__path, withList: true});
  list.pop();
  for (let rec of list) {
    if (rec.__assigned_desc === undefined) {
      rec.__assigned_desc = [];
    }
    
    addUndo(rec.__assigned_desc, sourceRec, {undo});
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
    destRec.__children.push(sourceRec);

    if (sourceRec.__destRecs === undefined) {
      sourceRec.__destRecs = [];
    }
    sourceRec.__destRecs.push(destRec);
  }
}

const assignSheet = (path, sourceRec, sourceSheet, Sheets) => {

  assignAncestors(sourceSheet, sourceRec, {undo:true})
  assignDescendants(sourceRec, {undo:true})
  
  const {__destRecs:dest} = sourceRec;
  if (dest) {
    for (let {__children:ch} of dest) {
      addUndo(ch, sourceRec, {undo:true});
    }
    dest.splice(0, dest.length);
  }  

  const {record:destRec} = fetch(path, Sheets);
  if (path.length > 0){
    assignAncestors(sourceSheet, sourceRec);
    assignDescendants(sourceRec);
    assignRec(sourceRec, destRec);  
  }
  // Note the sequence.
  // WHen assigning the ancestors, we have traversed the whole table
}

const condAssign = (cases, rec, sourceSheet, Sheets) => {

  rec.__cands = cases.length === 1
  ? [{result: true, path:cases[0].path}]
  : cases.map(({cond, path}) => {
      const {result} = evalExpr(cond, {Sheets, vars:rec});
      return {result, path};
    }).filter(({result}) => result);
  
  const destPath = rec.__cands.length === 1
  ? rec.__cands[0].path
  : 'INVALID';
  if (rec.__applyToSub){
    if (rec.__children === undefined) {
      assignSheet('INVALID', rec, sourceSheet, Sheets);
    } else for (let sub of rec.__children){
      assignSheet(destPath, sub, sourceSheet, Sheets);
    }
  } else {
    assignSheet(destPath, rec, sourceSheet, Sheets);
  }
}


module.exports = condAssign;