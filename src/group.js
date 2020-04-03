function group(table, key){

  let group = {};

  if (key === undefined) {
    throw {code: 'KEY_NOT_PROVIDED', from:'group'}
  }

  const labelFunc = key.constructor === Function
  ? (rec) => key(rec) 
  : (rec) => rec[key]

  for (let i = 0; i < table.length; i++){
    const rec = table[i];
    const label = labelFunc(rec);

    !(label in group) && (group[label] = []);
    group[label].push(rec);
  }
  return group;
}

module.exports = group;