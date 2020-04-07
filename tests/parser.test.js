const {add, get, pathify, flat, parse} = require('../dist');

Array.prototype.randomChoice = function(){
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.last = function() {
  return this[this.length - 1];
}

const data = [];

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

for (let i = 0; i < 5000; i++){
  const children = getRandomChildren(data) ;
  add(children, {num: Math.random() * 1000, name:'S' + Math.random().toString(31).slice(2, -4).toUpperCase()});
}
pathify(data);
const flattened = flat(data);
const paths = flattened.map(({__path}) => __path);

describe('evaluating expr', () => {
  test('parsing simple arithmetic', () => {
    expect(parse('-5').result).toBe(-5);
    expect(parse('-5.123').result).toBe(-5.123);
    expect(parse('1+1').result).toBe(2);
    expect(parse('3*(5+2)').result).toBe(21);
    expect(parse('3*(5+2.5)').result).toBe(22.5);
    expect(parse('(-3)*(5-2.5)').result).toBe(-7.5);
  });

  const tables = {
    __VARS: {
      a: 1, b:2, c:1, 借方: 20, 贷方:10
    },
    __COL_ALIASES: {aaa: 'a'}
  }

  test('parsing expression with variable table', () => {


    expect(parse('1 + $a', {tables}).result).toBe(2);
    expect(parse('-$a', {tables}).result).toBe(-1);
    expect(parse('3+ $b / $c', {tables}).result).toBe(5);
  })
  
  test('中文变量支持', () => {
    expect(parse('1+$借方-$贷方', {tables}).result).toBe(11);
  })

  test('indexColumn alias', () => {
    expect(parse('1 + $aaa', {tables}).result).toBe(2);
  })
  
  test('throwing error', () => {
    const {result, code} = parse('$asdbsd');
    expect(result).toBe(0);
    expect(code.code).toBe('VAR_NOT_FOUND');
    expect(code.varName).toBe('asdbsd');
  })
  
  test('comparison', () => {
    expect(parse('$a === $b', {tables}).result).toBe(1);
    expect(parse('$a === $c', {tables}).result).toBe('EQUAL');
  })

  test('malformed expression', () => {
    expect(() => parse('<>[]')).toThrowError('Expect');
  })
})

describe('var register', () => {
  test('var', () => {

    const tables = {__VARS:{}};
    parse('asd@1', {tables});
    expect(tables.__VARS.asd).toBe(1);
    expect(parse('1+$asd', {tables}).result).toBe(2);
  }) 
})

describe('func', () => {
  const tables = {__VARS:{}};
  test('func', () => {
    expect(parse('=asd( 123 )', {tables, func:{asd:(i) => i * 2}}).result).toBe(246);
  })
})

describe('path', () => {

  const indexColumn = 'name';
  const tables = {ARRAY:{data, indexColumn}};

  const path = paths.randomChoice();
  const {list} = get(data, {path, withList:true});
  const pathName = list.map(({name}) => name);
  const {record, siblings} = get(data, {path: pathName, indexColumn});
  const pathString = pathName.join('/');  

  test('name', () => {
    const {result, code} = parse(`YO:${pathString}:1`, {tables});
    expect(result).toBe(0);
    expect(code).toBe('SHEET_NOT_EXISTS');
  })

  test('incomplete path', () => {
    const nonExistPathString = pathString.slice(0, -3);
    const {result, code, siblings:sibs} = parse(`ARRAY:${nonExistPathString}`, {tables});
    expect(result).toBe(0);
    expect(code).toBe('RECORD_NOT_FOUND');
    expect(sibs).toBe(siblings);
  })

  test('complete path but no expr', () => {
    const {result, code} = parse(`ARRAY:${pathString}`, {tables});
    expect(result).toBe(0);
    expect(code).toBe("INCOMPLETE_REFERENCE_FORMAT");
  })

  test('not found var', () => {
    const {result, code} = parse(`ARRAY:${pathString}:$askd1`, {tables});
    expect(result).toBe(0);
    expect(code).toBe("VAR_NOT_FOUND");
  })

  test ('normal', () => {
    const {result, code} = parse(`ARRAY:${pathString}:($num * 2)+1`, {tables});
    expect(result).toBe(record.num * 2 + 1);
    expect(code).toBe(undefined);
  })

  test('path alias', () => {
    const altPath = [...pathName.slice(0, -1), 'aaa'].join('/');
    const __PATH_ALIASES = {aaa: [pathName.last()]};
    const {result, code} = parse(`ARRAY:${altPath}:($num * 2)+1`, {tables: {...tables, __PATH_ALIASES}});
  })
})