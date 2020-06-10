const get = require('../src/get');
const fetchPath = require('../src/fetch-path');

const {getRandomRec, createRandomData, getRandomPath} = require('./util');

describe('fetch path', () => {
  test('normal && not found && alternative', () => {

    const data = createRandomData({recs:500});
    // console.log(data, 'data');
    const Sheets = {TEST: {data, indexColumn: 'name'}};


    
    const {origRec, path: origPath} = getRandomPath('TEST', data);
    const {record:newRec} = fetchPath(origPath, Sheets);
    expect(newRec).toBe(origRec);

    const {path: origNotFound} = getRandomPath('TEST', data, {undef:true});
    const {record:notfoundRec} = fetchPath(origNotFound, Sheets);
    expect(notfoundRec).toBe(undefined);

    const {origRec:origAlterRec, path: origAlter, __PATH_ALIASES} = getRandomPath('TEST', data, {undef: true, replace: true});

    const {record:alterRec, code:alterCode} = fetchPath(origAlter, {...Sheets, __PATH_ALIASES});
    expect(alterRec).toBe(origAlterRec);
    expect(alterCode).toBe('INFO_ALTER_PATH');
  })

  test ('error', () => {

    expect(fetchPath({})).toHaveProperty('code', 'FAIL_INVALID_PATH');

    expect(fetchPath('asdasd', {})).toHaveProperty('code', 'FAIL_INVALID_PATH');

    expect(fetchPath('NAME:nothing', {})).toHaveProperty('code', 'WARN_SHEET_NOT_FOUND');


  })

})