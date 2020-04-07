const dup = (rec, init=true) => {
  let newRec = {...rec};
  newRec = JSON.parse(JSON.stringify(newRec));
  
  if (init){
    for (let key in newRec) switch (typeof key){
      case 'number':
        newRec[key] = 0; break;
      case 'string':
        newRec[key] = ""; break;
      case 'undefined':
        newRec[key] = ''; break;
      default:
        newRec[key] = {}; break;
    }
  }

  return newRec;
}

module.exports = dup;