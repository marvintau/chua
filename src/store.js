
const add = require('./add');
const get = require('./get');
const trav = require('./trav');
const fetch = require('./fetch');

const addUndo = (list, rec, {undo=false}={}) => {
  if (undo) {
    list.splice(list.findIndex(rec), 1);
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
    if (sourceRec.__destRecs === undefined) {
      sourceRec.__destRecs = [];
    }
    sourceRec.__destRecs.push(destRec);
    add(destRec.__children, sourceRec);
  }
}

const assignSheet = (path, sourceRec, sourceSheet, Sheets) => {

  assignAncestors(sourceSheet, sourceRec, {undo:true})
  assignDescendants(sourceRec, {undo:true})
  for (let {__children:ch} of sourceRec.__destRecs) {
    addUndo(ch, sourceRec, {undo:true});
  }

  const {record:destRec} = fetch(path, Sheets);

  // Note the sequence.
  // WHen assigning the ancestors, we have traversed the whole table
  assignAncestors(sourceSheet, sourceRec);
  assignDescendants(sourceRec);
  assignRec(sourceRec, destRec);

}

module.exports = assignSheet;