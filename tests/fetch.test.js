const get = require('../src/get');
const fetch = require('../src/fetch');

const {getRandomRec, createRandomData, getRandomPath} = require('../src/util');

describe('fetch path', () => {
  test('normal && not found && alternative', () => {

    const data = createRandomData({recs:500});
    // console.log(data, 'data');
    const Sheets = {TEST: {data, indexColumn: 'name'}};


    
    const {origRec, path: origPath} = getRandomPath('TEST', data);
    const {record:newRec} = fetch(origPath, Sheets);
    expect(newRec).toBe(origRec);

    let {path: origNotFound} = getRandomPath('TEST', data);
    origNotFound = origNotFound.replace(/[^/:]*$/, 'HEHE');
    const {record:notfoundRec, suggs} = fetch(origNotFound, Sheets);
    console.log(origNotFound, suggs, 'path');
    if (origNotFound.includes('/')){
      const orgTrimmed = origNotFound = origNotFound.replace('/HEHE', '');
      console.log(orgTrimmed);
      const {record:{__children:ch}} = fetch(orgTrimmed, Sheets);
      expect(suggs).toEqual(ch.map(({name}) => name));
    } else {
      expect(suggs).toEqual(data.map(({name}) => name));
    }
    expect(notfoundRec).toBe(undefined);

    const {origRec:origAlterRec, path: origAlter, __PATH_ALIASES} = getRandomPath('TEST', data, {undef: true, replace: true});

    const {record:alterRec, code:alterCode} = fetch(origAlter, {...Sheets, __PATH_ALIASES});
    expect(alterRec).toBe(origAlterRec);
    expect(alterCode).toBe('INFO_ALTER_PATH');


  })

  test ('error', () => {

    expect(fetch({})).toHaveProperty('code', 'FAIL_INVALID_PATH');

    expect(fetch('asdasd', {})).toHaveProperty('code', 'FAIL_INVALID_PATH');

    expect(fetch('NAME:nothing', {})).toHaveProperty('code', 'WARN_SHEET_NOT_FOUND');


  })

})