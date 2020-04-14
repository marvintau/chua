const read = (table, {delim="#", indexColumn='ref'}={}) => {

  count = function(string, delim) {
    return string.startsWith(delim) ? string.split(delim).length - 1 : 0;
  };
  
  last = function(array){
    return array[array.length - 1]
  };
  
  const cascTable = [];
  const stack = [];
  
  // Add a record to the table. Either add to the table directly, or
  // push into the children of stack-top record.
  // 
  // ============= NOTE FOR POSSIBLE REFACTOR IMPULSION ==============
  // We are not going to assign the __children with Object.defineProperty
  // here, because the non-enumerable properties WILL NOT BE serilaized.
  // 
  // Also, we are not going to assign __path although we can do it here,
  // because when evaluating the sheet in the client side, we are going
  // to perform the 'trav', which will be initializing the __path.
  const add = (rec) =>{

    Object.assign(rec, {__children:[]});

    (stack.length > 0 ? last(stack).__children : cascTable).push(rec);
  }
  
  // pop the stack to desination level.
  // e.g. the current stack stores the records reaching level 5, 
  //      but the coming record is a Level 2 one, then you going
  //      to pop until there's Level 1, and add the coming one as
  //      the children of Level 1.
  const pop = (destLevel) => {
    while (stack.length > 0 && count(last(stack)[indexColumn], delim) >= destLevel) {
      stack.pop();
    };
  }

  // The loop that does the real work:
  // check each record in the table.
  // if a record is Level 0 (not starts with '#'):
  //     added to the children of stack top, or the cascTable.
  // or, if a record is greater than Level 0,
  //     if greater than level of the record on the stack top
  //         add to the children of stack top, or the cascTable.
  //     otherwise,
  //         1. pop the current stack, until reaching the parent level of coming record
  //            (and it's okay to empty the stack)
  //         2. add to the children of stack top or the cascTable.
  //         3. push it onto the stack (and become the new stack top)
  for (let i = 0; i < table.length; i++){
    let rec = table[i];
    let currLevel = count(rec[indexColumn], delim);
    // console.log(stack.last() && stack.last().__children);
    if (currLevel > 0) {
      pop(currLevel);
      add(rec);
      stack.push(rec);
    } else {
      add(rec);
    }
  }
  
  return cascTable;
}

module.exports = read;