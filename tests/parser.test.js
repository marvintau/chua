const {add, get, flat, trav, parse} = require('../dist');

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

trav(data);

add(data, {num: 0, name:'（）'}, {atIndex: -1});
add(data, {num: 0, name:'【】'}, {atIndex: -1, path:[0]});
add(data, {num: 123, name:'「」'}, {atIndex: -1, path:[0, 0]});

const flattened = flat(data);
const paths = flattened.map(({__path}) => __path);

describe('evaluating expr', () => {
  test('parsing simple arithmetic', () => {
    expect(parse('1').result).toBe(1);
    expect(parse('-5').result).toBe(-5);
    expect(parse('-5.123').result).toBe(-5.123);
    expect(parse('1+1').result).toBe(2);
    expect(parse('3*(5+2)').result).toBe(21);
    expect(parse('3*(5+2.5)').result).toBe(22.5);
    expect(parse('(-3)*(5-2.5)').result).toBe(-7.5);
  });

  const Sheets = {
    __VARS: {
      a: 1, b:2, c:1, 借方: 20, 贷方:10
    },
    __COL_ALIASES: {aaa: 'a'}
  }

  test('parsing expression with variable table', () => {
    expect(parse('0', {Sheets}).result).toBe(0);
    expect(parse('1 + a', {Sheets}).result).toBe(2);
    expect(parse('-a', {Sheets}).result).toBe(-1);
    expect(parse('3+ b / c', {Sheets}).result).toBe(5);
  })
  
  test('中文变量支持', () => {
    expect(parse('1+借方-贷方', {Sheets}).result).toBe(11);
  })

  test('indexColumn alias', () => {
    expect(parse('1 + aaa', {Sheets}).result).toBe(2);
  })
  
  test('throwing error', () => {
    const {result, code, varName} = parse('asdbsd');
    expect(result).toBe(0);
    expect(code).toBe('WARN_VAR_NOT_FOUND');
    expect(varName).toBe('asdbsd');
  })
  
  test('comparison', () => {
    expect(parse('a === b', {Sheets}).result).toBe(1);
    expect(parse('a === c', {Sheets}).result).toBe('EQUAL');
  })

  // test('malformed expression', () => {
  //   expect(parse('<>[]').result).toBe('表达式错误');
  // })
})

describe('var register', () => {
  test('var', () => {

    const Sheets = {__VARS:{}};
    parse('asd@1', {Sheets});
    expect(Sheets.__VARS.asd).toBe(1);
    expect(parse('1+asd', {Sheets}).result).toBe(2);
  }) 
})

describe('path', () => {

  const indexColumn = 'name';
  const Sheets = {ARRAY:{data, indexColumn}};

  const path = paths.randomChoice();
  const {list} = get(data, {path, withList:true});
  const pathName = list.map(({name}) => name);
  const {record, siblings} = get(data, {path: pathName, indexColumn});
  const pathString = pathName.join('/');  

  test('name', () => {
    const {result, code} = parse(`YO:${pathString}:1`, {Sheets});
    expect(result).toBe(0);
    expect(code).toBe('WARN_SHEET_NOT_EXISTS');
  })

  test('incomplete path', () => {
    const nonExistPathString = pathString.slice(0, -3);
    const {result, code, suggs} = parse(`ARRAY:${nonExistPathString}`, {Sheets});
    expect(result).toBe(0);
    expect(code).toBe('WARN_RECORD_NOT_FOUND');
    expect(suggs).toEqual(siblings.map(({name}) => name));
  })

  test('中文特殊符号支持', () => {
    const {result} = parse('ARRAY:（）/【】/「」:num', {Sheets})
    expect(result).toBe(123);
  })

  test('complete path but no expr', () => {
    const {result, code} = parse(`ARRAY:${pathString}`, {Sheets});
    expect(result).toBe(0);
    expect(code).toBe("WARN_INCOMPLETE_REFERENCE_FORMAT");
  })

  test('not found var', () => {
    const {result, code} = parse(`ARRAY:${pathString}:askd1`, {Sheets});
    expect(result).toBe(0);
    expect(code).toBe("WARN_VAR_NOT_FOUND");
  })

  test ('normal', () => {
    const {result, code} = parse(`ARRAY:${pathString}:(num * 2)+1`, {Sheets});
    expect(result).toBe(record.num * 2 + 1);
    expect(code).toBe('NORM');
  })

  test('path alias', () => {
    const altPath = [...pathName.slice(0, -1), 'aaa'].join('/');
    const __PATH_ALIASES = {aaa: [pathName.last()]};
    const {result, code} = parse(`ARRAY:${altPath}:(num * 2)+1`, {Sheets: {...Sheets, __PATH_ALIASES}});
    expect(code).toBe('INFO_ALTER_PATH')
  })
})