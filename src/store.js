
const get = require('./get');
const trav = require('./trav');
const flat = require('./flat');
const fetch = require('./fetch');
const evalExpr = require('./expr');

const getAppliedRecs = (rec, applySpec) => {
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
      console.log(rec, 'detailed level')
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

const updateSucc = (sourceRec, {undo=false}={}) => {
  sourceRec.__assigned_ances = [];

  const scanDescendant = (descRec) => {
      
    if (descRec.__assigned_ances === undefined) {
      descRec.__assigned_ances = [];
    }
    addUndo(descRec.__assigned_ances, sourceRec, {undo})
  }

  const {__children: ch, __path: path} = sourceRec;
  ch && trav(ch, scanDescendant, 'PRE', path);
}

const updatePrev = (sourceSheet, sourceRec, {undo=false}={}) => {
  sourceRec.__assigned_desc = [];

  const {list} = get(sourceSheet, {path: sourceRec.__path, withList: true});
  list.pop();

  for (let AncesRec of list) {
    if (AncesRec.__assigned_desc === undefined) {
      AncesRec.__assigned_desc = [];
    }
    
    addUndo(AncesRec.__assigned_desc, sourceRec, {undo});
  }
}

// 注意，这个函数要应用在即将被送往destination的records上。
const getDestRec = (rec, cases, Sheets) => {
  if (cases.length === 1) {
    const {record} = fetch(cases[0].path, Sheets);
    console.log(cases[0].path, record);

    let error;
    if (record === undefined) {
      error = 'NOT_FOUND_DEST_RECORD'
    }

    return {error, record};
  } else {
    
    const cands = cases
    .map(({cond, path}) => {
      const {result} = evalExpr(cond, {Sheets, vars:rec});
      return {result, path};
    })
    .filter(({result}) => result);

    let {error, record} = cands.length < 1
    ? {error: 'NONE_SATISFIED_CASES'}
    : cands.length > 1
    ? {error: 'MULTI_SATISFIED_CASES'}
    : fetch(cands[0].path, Sheets);

    if (record === undefined) {
      error = 'NOT_FOUND_DEST_RECORD'
    }

    return {error, record};
  }
}

const assignSingleRec = (sourceRec, {undo=false, cases, Sheets}={}) => {

  // When undoing the current assignment of sourceRec, we don't care
  // about destRec if it's present, since the current assignment has
  // been stored in sourceRec.
  if (undo) {
    const {__dest_map:dest} = sourceRec;
    if (dest) {
      // Clear the assigned sourceRec @ destination.
      for (let [{__children:ch}, assignedRecs] of dest) {
        for (let assignedRec of assignedRecs) {
          addUndo(ch, assignedRec, {undo:true});
        }
      }
      // also clear the destinations @ dest after the last step.
      dest.clear();
    }
  } else {

    // check if the sourceRec is ancestor or descendends
    if (sourceRec.__assigned_desc.length > 0) {
      return {code: 'FAIL_TRYING_ASSIGN_ANCESTOR_OF_OTHER_ASSIGNED'};
    } else if (sourceRec.__assigned_ances.length > 0) {
      return {code: 'FAIL_TRYING_ASSIGN_DESCENDANT_OF_OTHER_ASSIGNED'};
    }
  
    // if not problem, we create a map to store and track the assigned
    // records. Since there could be multiple records to be applied, and
    // possibly multiple destinations.
    
    sourceRec.__dest_map = sourceRec.__dest_map || new Map();
    
    // if __apply_spec was not given, only one record, the sourceRec,
    // will be assigned to destination. Note that we use directly push,
    // since we don't wanted to change the path structure of both source
    // and traget table.
    
    if (!sourceRec.__apply_spec) {
      const {error, record:destRec} = getDestRec(sourceRec, cases, Sheets);
      if (error) {
        return {code: error};
      }
      sourceRec.__dest_map.set(destRec, [sourceRec]);
      
      destRec.__children = destRec.__children || [];
      destRec.__children.push(sourceRec);

    } else {
      const recsTobeApplied = getAppliedRecs(sourceRec, sourceRec.__apply_spec);

      // The reason of separating the loop, assigning __dest_map and actually assign
      // to dest, is because when we encounter error, we can simply stop and restore
      // __dest_map, without affecting dest.__children. 
      for (let appliedRec of recsTobeApplied) {
        const {error, record:destRec} = getDestRec(appliedRec, cases, Sheets);
        if (error) {
          sourceRec.__dest_map.clear();
          return {code: error};
        }
        
        sourceRec.__dest_map.set(destRec, sourceRec.__dest_map.get(destRec) || []);
        sourceRec.__dest_map.get(destRec).push(appliedRec);
      }

      console.log(sourceRec.__dest_map, 'check dest map');

      for (let [dest, applied] of sourceRec.__dest_map) {
        dest.__children = dest.__children || [];
        dest.__children.push(...applied);
      }
    }

  }

  return {};
}

const assignRec = (cases, rec, sourceSheet, Sheets) => {

  // removing previously assigned recs when we are re-assigning same
  // sourceRec.
  const undo = true;
  updatePrev(sourceSheet, rec, {undo})
  updateSucc(rec, {undo})
  assignSingleRec(rec, {undo})

  assignSingleRec(rec, {cases, Sheets});
  updatePrev(sourceSheet, rec);
  updateSucc(rec);
}


module.exports = assignRec;