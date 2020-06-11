const get = require('../src/get');
const trav = require('../src/trav');

Array.prototype.randomChoice = function(){
  const index = Math.floor(Math.random() * this.length);
  return [this[index], index];
}

Array.prototype.last = function() {
  return this[this.length - 1];
}

const getRandomRec = (array, {addProb=-1, stopProb=-1}={}) => {
  if (Math.random() < addProb || array.length === 0){
    return array;
  } else {

    let list = array, rec;

    while (list !== undefined && list.length > 0){
      rec = list.randomChoice()[0];
      if (Math.random() < stopProb || rec.__children === undefined || rec.__children.length === 0){
        return rec;
      } else {
        list = rec.__children;
      }
    }
    
    return rec;
  }
}


const createRandomData = ({recs=1000, addProb=0.5, stopProb=0.5}={}) => {

  const data = []

  for (let i = 0; i < recs; i++){
    
    const rec = getRandomRec(data, {addProb, stopProb}) ;
    
    const newRec = {
      num: Math.random() * 1000,
      name:'S' + Math.random().toString(31).slice(2, -4).toUpperCase(),
      calc:{result:Math.random() * 1000, code:'NORM'},
    };

    if (rec !== data) {
      if(rec.__children === undefined) {
        rec.__children = [];
      }
      rec.__children.push(newRec);
    } else {
      data.push(newRec);
    } 
  }
  
  trav(data);
  return data;
}

const pathFromList = (name, list, {column='name', undef=false, replace=false}) => {
  const segs = list.map(({[column]:col}) => col);

  const repString = 'HAHA!@#!@#';
  const __PATH_ALIASES = {};
  if (undef) {
    const [_, randomIndex] = segs.randomChoice();
    const [deleted] = segs.splice(randomIndex, 1, repString)
    if (replace) {
      __PATH_ALIASES[repString] = [deleted];
    }
  }

  const path = `${name}:${segs.join('/')}`;
  return {
    path,
    __PATH_ALIASES
  }
}

const getRandomPath = (name, array, {column='name', undef=false, replace=false}={}) => {
  const rec = getRandomRec(array);
  const {__path} = rec;

  const {list} = get(array, {path:__path, withList:true});

  const {path, __PATH_ALIASES} = pathFromList(name, list, {column, undef, replace});

  return { origRec: rec, path, __PATH_ALIASES }
}


function genName(vowelMinLen=4, vowelMaxLen=8, {end=true, capital=true}={}){

  const vowels = ['ar', 'ra', 're', 'co', 'mo', 'ge', 'be', 'ti'];
  const ends = ['ll', 'st', 'lt', 'sch', 'ius'];


  let len = Math.floor(Math.random()*(vowelMaxLen-vowelMinLen) + vowelMinLen);

  // avoiding same vowel repeats too many times in a name.
  let vowelMarked = vowels.map(e => ({key:e, rem:2}));

  let name = '';
  for (let i = 0; i < len; i++){
    const vowelIndex = Math.floor(Math.random()*vowels.length);
    const {key, rem} = vowelMarked[vowelIndex];
    if(rem > 0){
      vowelMarked[vowelIndex].rem --;
      name += key;
    }
  }

  // Both to make it looks more like a real name.
  if (end) {
    let endVowel = ends[Math.floor(Math.random()*ends.length)];
    name += endVowel;
  }

  if (capital){
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name;
}

module.exports = {
  createRandomData,
  getRandomRec,
  getRandomPath,
  genName
}