const {createRandomData} = require('../src/util');

describe('randomly generate data', () => {

  test('generate independent data', () => {
    
    const SOURCE = {
      name: 'SOURCE',
      data: createRandomData({schema: {ccode_name:'string', mc:'number', md:'number'}}),
      indexColumn: 'ccode_name'
    };

  })

})
