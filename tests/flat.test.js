const trav = require('../src/trav')
const flat = require('../src/flat')

const {createRandomData} = require('./util');

test('flattening', () => {

  const array = createRandomData();

  const count = (array) => {
    let counter = 0 ;
    trav(array, () => counter ++);
    return counter;
  }

  expect(count(array) === flat(array).length).toBe(true);
})
