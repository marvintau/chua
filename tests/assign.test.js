const get = require('../src/get');
const trav = require('../src/trav');
const flat = require('../src/flat');
const assign = require('../src/assign-path');

const {getRandomPath, getRandomRec, createRandomData} = require('./util');

describe('assign', () => {

  test('assign', () => {

    const Sheets = {
      SOURCE: {data: createRandomData({recs:10000, addProb:0.1, stopProb:0.1}), indexColumn: 'name'},
      TARGET: {data: createRandomData({recs:500, addProb:0.1, stopProb:0.1}), indexColumn: 'name'},
    }

    const {origRec:destRec, path} = getRandomPath('TARGET', Sheets.TARGET.data, {column:'name'});
    console.log(destRec, path);

    let attempts = 0, sourceRec;
    while(true){
      attempts ++;
      sourceRec = getRandomRec(Sheets.SOURCE.data, {stopProb:0.5});
      if (sourceRec.__children !== undefined && sourceRec.__path.length > 1) {
        break;
      }
      if (attempts > 10000) {
        attempts = -1;
        break;
      }
    }
    console.log(sourceRec.name, 'source rec name');
    if (attempts > 0) {
      assign(path, sourceRec, Sheets.SOURCE.data, Sheets);
  
      const descs = flat(sourceRec.__children);
      expect(descs.every(({__assigned_ances:[ances]}) => ances === sourceRec)).toBe(true);
  
      const {record, list} = get(Sheets.SOURCE.data, {path: sourceRec.__path, withList:true});
      expect(record.name).toBe(sourceRec.name);
      // expect(record).toBe(sourceRec);
      expect(list.slice(0, -1).every(({__assigned_desc:[desc]}) => desc === sourceRec)).toBe(true);
    } else {
      console.warn('not found proper source record, run test again.')
    }
    
  })

})