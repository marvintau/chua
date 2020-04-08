var now = require("performance-now")
const Benchmark = require('benchmark');

const {add, get, trav, flat} = require('../src');

const suite = new Benchmark.Suite;
const bigArray = [];

Array.prototype.randomChoice = function(){
  return this[Math.floor(Math.random() * this.length)];
}

const getRandomChildren = (array) => {
  if (Math.random() > 0.5 || array.length === 0){
    return array;
  } else {

    let list = array, rec;

    while (list !== undefined && list.length > 0){
      rec = list.randomChoice();
      if (Math.random() > 0.5 || rec == undefined){
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

const timings = [];

const start = now();
for (let i = 0; i < 50000; i++){
  const children = getRandomChildren(bigArray) ;
  add(children, {num: Math.random() * 1000, name:Math.random().toString(7, 32)});
}  
const afterInit = now();
timings.push({timeElapsed: afterInit - start});
trav(bigArray);
const afterPath = now();
timings.push({timeElapsed: afterPath - afterInit});
const flattened = flat(bigArray);
const paths = flattened.map(({__path}) => __path);
const afterFlatten = now();
timings.push({timeElapsed: afterFlatten - afterPath});
for (let elem of timings){
  elem.timeElapsed = elem.timeElapsed.toFixed(6).padStart(20);
}
console.table(timings);


// suite.add('init', () => {
//   const path = paths.randomChoice();
//   get(bigArray, {path});
// }).on('complete', function(){
//   console.log(this[0].times);
// }).run({async: false})