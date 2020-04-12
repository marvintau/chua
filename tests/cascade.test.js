const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');

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

    !(newRec.iperiod) && (newRec.iperiod = 0);
    (newRec.ccode) && (newRec.ccode = newRec.ccode.toString());
    
    table[p] = newRec;
  }

  return table
}

let header = [
  ['会计年' , 'iyear'],
  ['会计月' , 'iperiod'],
  ['科目编号' , 'ccode'],
  ['科目编码', 'ccode'],
  ['科目名称' , 'ccode_name'],
  ['科目类别' , 'cclass'],

  ['期初数' , 'mb'],
  ['账面期初数' , 'mb'],
  ['账面期初余额' , 'mb'],
  ['期初余额' , 'mb'],
  ['期初金额' , 'mb'],
  ['期初余额借方' , 'mbd'],
  ['期初余额贷方' , 'mbc'],
  
  ['本期发生借方', 'md'],
  ['账面借方发生额' , 'md'],
  ['未审借方发生额' , 'md'],
  ['借方发生额', 'md'],

  ['账面贷方发生额' , 'mc'],
  ['贷方发生额' , 'mc'],
  ['未审贷方发生额' , 'mc'],
  ['本期发生贷方', 'mc'],

  ['期末数' , 'me'],
  ['账面期末数' , 'me'],
  ['账面期末余额' , 'me'],
  ['期末金额' , 'me'],
  ['期末余额' , 'me'],
  ['期末余额借方' , 'med'],
  ['期末余额贷方' , 'mec'],
]

describe('cascade table', () => {

  test('cascade table', async () => {

    const file = await fs.readFile(path.resolve(__dirname, 'BALANCE.xlsx'));
    const sheet = readSingleSheet(file);
    const table = columnNameRemap(sheet, header);

    const {casc, get} = require('../dist');
    const cascCol = 'ccode';
    const cascaded = casc(table, {cascCol});
    
    expect(cascaded.map(({ccode}) => ccode.length).every(e => e === 4)).toBe(true);

    // console.log(table[0].__children, 'yes');
    const {flat, trav} = require('../dist');
    trav(cascaded);
    const flattened = flat(table);
    const paths = flattened.map(({__path})=>__path).filter(e => e.length > 3);
    const {record, list} = get(cascaded, {path:paths[Math.floor(Math.random() * paths.length)], withList: true});
    
    const ccodeNameList = list.map(({ccode_name}) => ccode_name);
    const {record:newRec} = get(cascaded, {path: ccodeNameList, indexColumn:'ccode_name'});
    expect(record).toBe(newRec);
  })
})