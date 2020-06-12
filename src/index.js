const group = require('./group');
const sort = require('./sort');
const flat = require('./flat');
const casc = require('./casc');
const read = require('./read');
const trav = require('./trav');
const get = require('./get');
const set = require('./set');
const add = require('./add');
const del = require('./del');
const expr = require('./expr');

const fetch = require('./fetch');
const store = require('./store');

const {
  createRandomData,
  getRandomRec,
  getRandomPath,
  genName,
  choice
} = require('./util');


module.exports = {
  add,
  del,
  get,
  set,
  casc,
  read,
  sort,
  flat,
  trav,
  expr,
  group,
  fetch,
  store,
  utils: {
    createRandomData,
    getRandomRec,
    getRandomPath,
    genName,
    choice  
  }
}