{
	var parserInstance = this;
    
  var {func, tables, get} = parserInstance;

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
  }
  /RefExpr

RefExpr
  = PathExpr
  / FuncExpr
  / ArithExpr

FuncExpr
  = "=" funcName:Literal _ "(" _  arg:Integer _ ")" {
    if ((funcName in func)){
      return {result:func[funcName](arg)};
    } else {
      return { result: 0, code: "UNDEFINED_FUNC"}
    }
  }

PathExpr
  = SheetName ":" siblings:Path expr:(":" ArithExpr)* {

    let {Sheet, Path, Var} = error;

    let code, result = 0;
    if (Sheet) {
      code = Sheet;
    } else if (Path){
      code = Path;
    } else {
      if (expr.length === 0){
        code = 'INCOMPLETE_REFERENCE_FORMAT'
      } else if (Var) {
        code = error.Var.code;
      } else {
        const {result:exprRes, code:exprCode} = expr[0][1];
        result = exprRes;
        code   = exprCode;
      }
    }
    return { siblings, result, code }
  }

SheetName
  = Literal {
    const sheetName = text();

    if(tables[sheetName] === undefined){
      error.Sheet = 'SHEET_NOT_EXISTS';
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
      return siblings;
    } else {
      const candidatePaths = outer(path.map(seg => (seg in __PATH_ALIASES) ? __PATH_ALIASES[seg] : [seg] ));
      for (let candiPath of candidatePaths){
        let {record, siblings} = get(data, {path: candiPath, indexColumn})
        if (record !== undefined){
          varsLocal = {...__VARS, ...record};
          return siblings;
        }
      }
      error.Path = 'RECORD_NOT_FOUND';
      return siblings;
    }
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
        code: error.Var
      }
    } else {
      return { result: (first === last) ? 'EQUAL' : Math.abs(first - last) }
    }

  }

ExprAlt
  = head:(Term)? tail:(_ ("+" / "-") _ Term)* {

    if (error.Var) {
      return {
        result: 0,
        code: error.Var
      }
    } else {
      const result = tail.reduce(function(result, element) {
      	switch(element[1]){
        	case '+': return result + element[3];
          case '-': return result - element[3];
        }
      }, head ? head : 0);
      return {result};
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
  = _ '$' lit:Literal* {

    if (lit in varsLocal){
      return varsLocal[lit];
    } else if (__COL_ALIASES[lit] in varsLocal) {
      // console.log('here');
      return varsLocal[__COL_ALIASES[lit]];
    } else {
      error.Var = {code: 'VAR_NOT_FOUND', varName:lit[0]};
      return 0;
    }
  }

Literal 'literal'
  = [A-Za-z\u4E00-\u9FA5][A-Za-z0-9\u4E00-\u9FA5_]* {
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
    code: 'MALFORMED',
    result: 0
  }
}