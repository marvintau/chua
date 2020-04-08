{
	var parserInstance = this;
    
  var {func, tables, get, self} = parserInstance;

  var {__VARS, __COL_ALIASES={}, __PATH_ALIASES={}} = tables;

  var table;
  var varsLocal = {...__VARS};

  var error = {};

  const outer = (listOfLists) => {

    if (listOfLists.some(elem => !Array.isArray(elem))){
      throw Error('outer必须得用在list of lists上')
    }

    if (listOfLists.length === 0){
      return [];
    }

    let [first, ...rest] = listOfLists,
      res = first.map(e => [e]);

    for (let list of rest){
      res = res.map(e => list.map(l => e.concat(l))).flat();
    }

    return res;
  }

}

VarExpr
  = varName:Literal '@' ref:RefExpr {
    __VARS[varName] = ref.result;
    return ref;
  }
  /RefExpr

RefExpr
  = res:(FuncExpr / PathExpr / ArithExpr) {
    return res;
  }

FuncExpr
  = "=" funcName:Literal _ "(" _  arg:Integer? _ ")" {
    if (funcName in func){
      const res = func[funcName](self);
      // console.log(Object.keys(func), funcName, res, 'func');
      return res;
    } else {
      return { result: 0, code: 'WARN_UNDEFINED_FUNC'}
    }
  }

PathExpr
  = SheetName ":" suggs:Path expr:(":" ArithExpr)* {
    let {Sheet, Path, Var} = error;

    let code, result = 0;
    if (Sheet) {
      code = Sheet;
    } else if (Path && !Path.startsWith('INFO')){
      console.log(Path, 'path error');
      code = Path;
    } else {
      if (expr.length === 0){
        code = 'WARN_INCOMPLETE_REFERENCE_FORMAT'
      } else if (Var) {
        code = error.Var.code;
      } else {
        const {result:exprRes, code:exprCode} = expr[0][1];
        result = exprRes;
        code   = Path !== undefined ? Path : exprCode;
      }
    }
    return { suggs, result, code }
  }

SheetName
  = Literal {
    const sheetName = text();

    if(tables[sheetName] === undefined){
      error.Sheet = 'WARN_SHEET_NOT_EXISTS';
    } else {
      table = tables[sheetName];
    }
  }

Path
  = head:Literal tail:("/" Literal)* {

    // By here we did the parsing
    if (error.Sheet) {
      error.Path = error.Sheet;
      return;
    }

    const path = tail.reduce((result, elem) => {
      return result.concat(elem[1]);
    }, [head]);

    const {data, indexColumn} = table;

    let {record, siblings} = get(data, {path, indexColumn})

    if (record !== undefined){
      varsLocal = {...__VARS, ...record};
    } else {
      const candidatePaths = outer(path.map(seg => (seg in __PATH_ALIASES) ? __PATH_ALIASES[seg] : [seg] ));
      for (let candiPath of candidatePaths){
        let {record, siblings} = get(data, {path: candiPath, indexColumn})
        if (record !== undefined){
          varsLocal = {...__VARS, ...record};
          error.Path = 'INFO_ALTER_PATH';
          return siblings;
        }
      }
      error.Path = 'WARN_RECORD_NOT_FOUND';
    }
    return siblings.map(({[indexColumn]:col}) => col);
  }

ArithExpr
  = Comp
  / ExprAlt
  / __

Comp
  = first:Factor _ "===" _ last:Factor {
    
    if (error.Var){
      return {
        result: 0,
        ...error.Var
      }
    } else {
      const [result, code] = (first === last)
        ? ['EQUAL', 'SUCC_TEST']
        : [Math.abs(first - last), 'WARN_NOT_EQUAL']
      
      return {result, code}
    }

  }

ExprAlt
  = head:(Term)? tail:(_ ("+" / "-") _ Term)* {

    if (error.Var) {
      return {
        result: 0,
        ...error.Var
      }
    } else {
      const result = tail.reduce(function(result, element) {
      	switch(element[1]){
        	case '+': return result + element[3];
          case '-': return result - element[3];
        }
      }, head ? head : 0);
      return {result, code: 'NORM'};
    }

  }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
      	switch(element[1]){
        	case '*': return result * element[3];
          case '/': return result / element[3];
        }
      }, head);
    }

Factor
  = "(" _ expr:ExprAlt _ ")" { return expr.result; }
  / Variable
  / Real
  / Integer

Variable 'variable'
  = _ lit:Literal {

    if (lit in varsLocal){
      return varsLocal[lit];
    } else if (__COL_ALIASES[lit] in varsLocal) {
      // console.log('here');
      return varsLocal[__COL_ALIASES[lit]];
    } else {
      error.Var = {code: 'WARN_VAR_NOT_FOUND', varName:lit};
      return 0;
    }
  }

Literal 'literal'
  = [A-Za-z&\u4E00-\u9FA5][A-Za-z0-9&\u4E00-\u9FA5_]* {
    return text();
  }

Real 'real number'
  = _ Integer ('.' Integer ([eE] [+-] Integer)?)? { return parseFloat(text());}

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*

__ "wild" = .* {
  return {
    code: 'WARN_MALFORMED',
    result: 0
  }
}