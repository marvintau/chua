const expr = require('../src/expr')
const {createRandomData} = require('../src/util')

describe('expr suites', () => {

  const Sheets = {
    __VARS: {
      a: 1, b:2, c:1, 借方: 20, 贷方:10
    },
    __COL_ALIASES: {aaa: 'a'},
    TEST: {data:createRandomData(), indexColumn: 'name'}
  }

  describe('arithmetic expr', () => {

    test('parsing simple arithmetic', () => {
      expect(expr('1').result).toBe(1);
      expect(expr('-5').result).toBe(-5);
      expect(expr('-5.123').result).toBe(-5.123);
      expect(expr('1+1').result).toBe(2);
      expect(expr('3*(5+2)').result).toBe(21);
      expect(expr('3*(5+2.5)').result).toBe(22.5);
      expect(expr('(-3)*(5-2.5)').result).toBe(-7.5);
    });
  
    test('parsing expression with variable table', () => {
      expect(expr('0', {Sheets}).result).toBe(0);
      expect(expr('1 + a', {Sheets}).result).toBe(2);
      expect(expr('-a', {Sheets}).result).toBe(-1);
      expect(expr('3+ b / c', {Sheets}).result).toBe(5);
    })
    
    test('中文变量支持', () => {
      expect(expr('1+借方-贷方', {Sheets}).result).toBe(11);
    })
  
    test('indexColumn alias', () => {
      expect(expr('1 + aaa', {Sheets}).result).toBe(2);
    })
    
    test('throwing error', () => {
      const {result, code, varName} = expr('asdbsd');
      expect(result).toBe(0);
      expect(code).toBe('WARN_VAR_NOT_FOUND');
      expect(varName).toBe('asdbsd');
      // expect(expr(',').result).toBe('表达式错误');
    })
  })
  
  describe('comparison expr', () => {
    test('simple compare', () => {
      expect(expr('1 < 2').result).toBe(true);
      expect(expr('2 > 1').result).toBe(true);
      expect(expr('1 <= 2').result).toBe(true);
      expect(expr('2 >= 1').result).toBe(true);
      expect(expr('1 <= 1').result).toBe(true);
      expect(expr('1 >= 1').result).toBe(true);
  
      expect(expr('1 < 1').result).toBe(false);
      expect(expr('1 <= 0').result).toBe(false);
  
      expect(expr('2.1 >= 1.1').result).toBe(true);
      expect(expr('1.1 >= 1.1').result).toBe(true);
      expect(expr('1.1 <= 1.1').result).toBe(true);
      expect(expr('1.1 <= 2.1').result).toBe(true);
  
      expect(expr('1.000000000 < 1.0000000001').result).toBe(false);
      expect(expr('1.000000000 <= 1.0000000001').result).toBe(true);
      expect(expr('1.000000000 >= 1.0000000001').result).toBe(true);
  
      expect(expr('1.1e5 >= 1.1e4').result).toBe(true);
  
      expect(expr('1 === 1').result).toBe(true);
      expect(expr('1 === 2').result).toBeCloseTo(1);
  
    })
  
    test('comparison with arithmetic expr', () => {
      expect(expr('(1 + 1) === 2').result).toBe(true);
      expect(expr('(1 + 1) >= 2').result).toBe(true);
      expect(expr('(1 + 1) <= 2').result).toBe(true);
    })
  
    test('variable registration', () => {
      expect(expr('newVar@(1+1) >= 2', {Sheets}).result).toBe(true);
      expect(expr('newVar', {Sheets}).result).toBe(true);
      expect(expr('newVar + 1', {Sheets}).result).toBe(2);
    })
  })

  describe('func expr', () => {
    test('func expr', () => {
      const vars = Sheets.TEST.data[0];
      const list = vars.__children.map(({calc:{result}}) => result);
      const first = vars.__children[0].calc.result;
      expect(expr('=SUMSUB()', {vars, colKey:'calc'}).result).toBeCloseTo(list.reduce((acc, e) => acc + e, 0));
      expect(expr('=NONE()', {vars}).result).toBe(undefined);
      expect(expr('=SUB(0)', {vars, colKey:'calc'}).result).toBe(first);
    })
  })
})

