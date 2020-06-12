const {genName, choice} = require('../src/util');

const flat = require('../src/flat');
const trav = require('../src/trav');
const get  = require('../src/get');
const add  = require('../src/add');

let a = 1,
    b = a + 1;

const getRec = () => {
  a += 2;
  b += 2;
  return {a, b, name: genName()};
}

const getRecs = (num) => {
  const res = [];
  for (let i = 0; i < num; i++) res.push(getRec());
  return res;
}

const array = []

test('trav', () => {
  add(array, getRecs(20));

  trav(array);
  const flattened = flat(array);
  const [rec] = choice(flattened);
  const {record} = get(array, {path: rec.__path});
  expect(rec).toBe(record);

  expect(() => trav(array, e => e, 'OOPS')).toThrow();
})

test('trav error', () => {
  try{
    trav([], 'NONO');
  } catch (error) {
    // console.log(error);
    expect(code).toBe('INVLAID_TRAV_ORDER');
  }
})