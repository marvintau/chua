const get = require('../src/get');
const trav = require('../src/trav');
const flat = require('../src/flat');
const store = require('../src/store');

const {getRandomPath, getRandomRec, createRandomData} = require('../src/util');

describe('assign', () => {

  test('assign', () => {

    const Sheets = {
      SOURCE: {data: createRandomData({recs:10000, addProb:0.1, stopProb:0.1}), indexColumn: 'name'},
      TARGET: {data: createRandomData({recs:500, addProb:0.1, stopProb:0.1}), indexColumn: 'name'},
    }

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

    if (attempts > 0) {

      const {origRec:destRec, path} = getRandomPath('TARGET', Sheets.TARGET.data, {column:'name'});

      store([{path}], sourceRec, Sheets.SOURCE.data, Sheets);
  
      const descs = flat(sourceRec.__children);
      const {list:ancesList} = get(Sheets.SOURCE.data, {path: sourceRec.__path, withList:true});

      expect(descs.every(({__assigned_ances:[ances]}) => ances === sourceRec)).toBe(true);  
      expect(ancesList.slice(0, -1).every(({__assigned_desc:[desc]}) => desc === sourceRec)).toBe(true);
      expect(destRec.__children).toContain(sourceRec);
      expect(sourceRec.__dest_map.has(destRec)).toBe(true);


      const {origRec:newDestRec, path: newPath} = getRandomPath('TARGET', Sheets.TARGET.data, {column:'name'});
    
      const {__path:newPathSegs} = newDestRec;
      const {record: newDestRecRec} = get(Sheets.TARGET.data, {path: newPathSegs})

      store([{path: newPath}], sourceRec, Sheets.SOURCE.data, Sheets);

      const newDescs = flat(sourceRec.__children);
      const {list:newAncesList} = get(Sheets.SOURCE.data, {path: sourceRec.__path, withList:true});

      expect(newDescs.every(({__assigned_ances:[ances]}) => ances === sourceRec)).toBe(true);  
      expect(newAncesList.slice(0, -1).every(({__assigned_desc:[desc]}) => desc === sourceRec)).toBe(true);
      // expect(destRec.__children).not.toContain(sourceRec);
      // expect(sourceRec.__destRecs).toContain(newDestRec);
      // expect(sourceRec.__destRecs).not.toContain(destRec);
      // expect(newDestRec.__children).toContain(sourceRec);


    } else {
      console.warn('not found proper source record, run test again.')
    }
    
  })

})