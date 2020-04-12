const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');

let header = [
  ['项目', 'desc'],
  ['条目', 'desc'],
  ['取值', 'expr'],
  ['值', 'expr'],
]

function readSingleSheet(buffer, withHeader=true){
  const table = XLSX.read(buffer, {type:'buffer'});
  const firstSheet = table.Sheets[table.SheetNames[0]];  
  if (withHeader) {
    return XLSX.utils.sheet_to_json(firstSheet);
  } else {
    return XLSX.utils.sheet_to_json(firstSheet, {header: 1});
  }
}

function columnNameRemap(table, map){
  
  for (let p = 0; p < table.length; p++){
    let rec = table[p],
      newRec = {};

    for (let [oldKey, newKey] of map){
      (oldKey in rec) && (newRec[newKey] = rec[oldKey]);
    }

    (!newRec.iperiod) && (newRec.iperiod = 0);
    (newRec.ccode) && (newRec.ccode = newRec.ccode.toString());
    
    table[p] = newRec;
  }

  return table
}

describe('reading', () => {
  test('reading', async () => {

    const {read, flat} = require('../dist')

    const file = await fs.readFile(path.resolve(__dirname, 'CASHFLOW_STATEMENT_TEMPLATE.xlsx'));
    const sheet = readSingleSheet(file);
    const table = columnNameRemap(sheet, header);

    const readTable = read(table, {indexColumn: 'desc'});
    expect(readTable.map(({desc}) => desc).every(e => e.startsWith('#') && e.split('#').length === 2)).toBe(true);
    const level2 = readTable.map(({__children}) => __children).flat();
    expect(level2.map(({desc}) => desc).every(e => e.startsWith('#') && e.split('#').length === 3)).toBe(true);

    console.log(flat(readTable).filter(({desc}) => !desc.startsWith('#')).length)
  })
})