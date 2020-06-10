const get = require('../src/get');
const fetchPath = require('../src/fetch-path');
const assign = require('../src/assign');

const {getRandomRec, createRandomData} = require('./util');

describe('assign', () => {

  test('assign', () => {

    const Sheets = {
      SOURCE: {data: createRandomData(), indexColumn: 'name'},
      TARGET: {data: createRandomData(), indexColumn: 'name'},
    }

    const targetRec = getRandomRec(Sheets.TARGET.data);
    
    

  })

})