var Window = require('window');
global.window = new Window();

const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;
const {add, get, trav, flat, parse} = require('../dist');

const bigArray = [];

Array.prototype.randomChoice = function(){
  return this[Math.floor(Math.random() * this.length)];
}

const PROB_ADD_ROOT = 0.3,
      PROB_GO_DEEP = 0;

const getRandomChildren = (array) => {
  if (Math.random() < PROB_ADD_ROOT || array.length === 0){
    return array;
  } else {

    let list = array, rec;

    while (list !== undefined && list.length > 0){
      rec = list.randomChoice();
      if (Math.random() < PROB_GO_DEEP || rec == undefined){
        break;
      } else {
        list = rec.__children;
      }
    }
    if (rec.__children === undefined){
      rec.__children = [];
    }
    return rec.__children;  
  }
}

for (let i = 0; i < 500; i++){
  const children = getRandomChildren(bigArray) ;
  add(children, {num: Math.random() * 1000, name:'S' + Math.random().toString(32).slice(4, 10)});
}  
trav(bigArray);
const flattened = flat(bigArray);

const TAKE = 100;

let paths = flattened.map(({__path}) => __path);
let namePath = [], withList = true;
for (let i = 0, len = paths.length; i < len; i++){
  const path = paths[i];
  const {list} = get(bigArray, {path, withList});
  // console.log(get)
  namePath.push(list.map(({name}) => name));
}
namePath.sort((a, b) => b.length - a.length);
namePath = namePath.slice(0, TAKE);
paths = paths.slice(0, TAKE);
console.log(namePath);

const parseData = {tables:{ARRAY:{data:bigArray, indexColumn:'name'}}};

suite
.add('index-column-path', () => {
  const path = namePath.randomChoice();
  get(bigArray, {path, indexColumn:'name'});
})
.add('index-path', () => {
  const path = paths.randomChoice();
  get(bigArray, {path});
})
.add('parse-arith-expr', () => {
  parse('(3 + 1) * 2.5', {});
})
.add('parse-addressing', () => {
  const path = namePath.randomChoice();
  parse(`ARRAY:${path.join('/')}:(num * 2)+1`, parseData);
})
.on('complete', function(){
  console.log(this.map(({name, times})=> ({name, times})));
}).run({async: false})