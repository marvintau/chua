String.prototype.count = function(delim) {
  return this.startsWith(delim) ? this.split(delim).length - 1 : 0;
};

Array.prototype.last = function(){
  return this[this.length - 1]
};

const read = (table, {delim="#", indexColumn='ref'}={}) => {

  const cascTable = [];
  const stack = [];
  
  // when adding a new record into the table, we check where we are.
  // If the stack is currently empty, we are adding the record to the cascTable.
  // Otherwise, add to the children of the current stack top.
  // 
  // however, for each time before adding new record, the stack should
  // pop to appropriate level.
  const add = (rec) =>{
    const configurable = true;

    const props = (path) => ({
      '__path': {value: path, configurable},
      '__children': {value: [], configurable}
    })

    if (stack.length > 0){
      const {__children:subs, __path:path} = stack.last();
      Object.defineProperties(rec, props(path.concat(subs.length)));
      subs.push(rec);
    } else {
      Object.defineProperties(rec, props([cascTable.length]));
      cascTable.push(rec);
    }
  }
  
  // pop the stack to desination level.
  // e.g. the current stack stores the records reaching level 5, 
  //      but the coming record is a Level 2 one, then you going
  //      to pop until there's Level 1, and add the coming one as
  //      the children of Level 1.
  const pop = (destLevel) => {
    while (stack.length > 0 && stack.last()[indexColumn].count(delim) >= destLevel) {
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
    let currLevel = rec[indexColumn].count(delim);
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