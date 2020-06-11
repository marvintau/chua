const add = require('../src/add')
const group = require('../src/group')

test('group', () => {

  const groupArr = [];
  add(groupArr, {a: 'a', b:'b'});
  add(groupArr, {a: 'a', b:'c'});
  add(groupArr, {a: 'bc', b:'c'});
  add(groupArr, {a: 'bc', b:'d'});

  expect(() => group(groupArr)).toThrow();
  expect(group(groupArr, 'a').a.length).toBe(2);
  expect(group(groupArr, ({a}) => a.length)['1'].length).toBe(2);
})