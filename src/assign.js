const add = require('./add');
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
    trav(rec.__children, scanDescendant);
  }
}

const assignAncestors = (sourceSheet, sourceRec, options) => {

  const scanAncestor = (rec) => {
    const {__children: ch=[]} = rec;
    rec.__assigned_desc = ch 
      ? ch.map(({__assigned_desc:desc}) => desc || []).flat()
      : [];

    if (ch.includes(sourceRec)) {
      rec.__assigned_desc.push(sourceRec);
    }

    if (options) {
      Object.assign(rec, options);
    }
  }

  trav(sourceSheet, scanAncestor, 'POST')

}

const assignRec = (sourceRec, destRec) => {

  if (sourceRec.__assigned_desc.length > 0) {
    throw {code: 'DEAD_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if ( sourceRec.__assigned_ances.length > 0) {
    throw {code: 'DEAD_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
  }

  if (destRec === undefined){
    console.log('target record not exists');
  } else if (destRec.__children.includes(sourceRec)){
    console.log('source record has been assigned');
  } else {
    add(destRec.__children, rec);
  }
}

const assignSheet = (path, sourceRec, sourceSheet, Sheets, {ancestorOptions, descendantOptions}={}) => {

  const {record:destRec} = fetchPath(path, Sheets);

  trav(sourceSheet, (rec) => {
    const {__assigned_ances: ances, __assigned_desc: desc} = rec;
    ances.splice(ances.findIndex(sourceRec), 1)
    desc.splice(desc.findIndex(sourceRec), 1);
  })

  // Note the sequence.
  // WHen assigning the ancestors, we have traversed the whole table
  assignAncestors(sourceSheet, rec, ancestorOptions);
  assignDescendants(rec, descendantOptions);
  assignRec(sourceRec, destRec);

}

module.exports = assignSheet;