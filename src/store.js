
const get = require('./get');
const trav = require('./trav');
const flat = require('./flat');
const fetch = require('./fetch');
const evalExpr = require('./expr');

const parseApplySpec = (rec, applySpec) => {
  if(rec.__children === undefined) {
    return [];
  } else if(applySpec.match(/^\d+$/)) {
    const level = parseInt(applySpec);
    return flat(rec.__children).filter(({__path}) => __path.length === rec.__path.length + level);
  } else {
    const [name, value] = applySpec.split(':');
    if (value !== undefined) {
      return flat(rec.__children).filter(({[name]:prop}) => prop === value);
    } else {
      return flat(rec.__children).filter(({[name]:prop}) => prop);
    }
  }
}

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
    return {code: 'FAIL_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if (sourceRec.__assigned_ances.length > 0) {
    return {code: 'FAIL_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if (destRec === undefined){
    return {code: 'FAIL_TARGET_RECORD_NOT_EXIST'};
  } else if (destRec.__children && destRec.__children.includes(sourceRec)){
    return {code: 'WARN_POSSIBLE_DUPLICATE_ASSIGN'}
  } else {
    if (destRec.__children === undefined) {
      destRec.__children = [];
    }
    destRec.__children.push(sourceRec);

    if (sourceRec.__destRecs === undefined) {
      sourceRec.__destRecs = [];
    }
    sourceRec.__destRecs.push(destRec);

    return {};
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
    
    return assignRec(sourceRec, destRec);  
  }

  return {};
}

const getCands = (rec, cases, Sheets) => {
  return cases.length === 1
  ? [{result: true, path:cases[0].path}]
  : cases.map(({cond, path}) => {
    const {result} = evalExpr(cond, {Sheets, vars:rec});
    return {result, path};
  }).filter(({result}) => result);
}

const condAssign = (cases, rec, sourceSheet, Sheets) => {

  if (rec.__apply_spec === undefined) {
    rec.__cands = getCands(rec, cases, Sheets);

    const destPath = rec.__cands.length === 1
    ? rec.__cands[0].path
    : 'INVALID';
  
    return assignSheet(destPath, rec, sourceSheet, Sheets);
  } else {

    const finalyApplyTo = parseApplySpec(rec.__apply_spec, rec);

    for (let sub of finalyApplyTo) {
      sub.__cands = getCands(sub, cases, Sheets);

      const destPath = sub.__cands.length === 1
      ? sub.__cands[0].path
      : 'INVALID';

      assignSheet(destPath, sub, sourceSheet, Sheets);
    }
    return {};
  }
}


module.exports = condAssign;