{
	var parserInstance = this;
    
  var {func, Sheets, vars} = parserInstance;

  var {__VARS, __COL_ALIASES={}} = Sheets;

  var varsLocal = {...__VARS, ...vars};

  var error={};
}

VarExpr
  = varName:Literal '@' ref:RefExpr {
    __VARS[varName] = ref.result;
    return ref;
  }
  /RefExpr

RefExpr
  = res:(FuncExpr / ArithExpr) {
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

ArithExpr
  = Comp
  / ExprAlt
  / __

Comp
  = first:Factor _ "===" _ last:Factor {
    
    if (error.code){
      const {varName, code} = error;
      let desc = varName && `名为${varName}的变量未找到`;
      return {result: 0, code, desc}
    } else {
      const [result, code] = (first === last || Math.abs(first - last) < 1e-5 )
        ? ['EQUAL', 'SUCC_TEST']
        : [Math.abs(first - last), 'WARN_NOT_EQUAL']
      
      return {result, code}
    }
  }
  / first: Factor _ comp:('>' / '<' / '>=' / '<=') _ last: Factor {

    if (error.code){
      const {varName, code} = error;
      let desc = varName && `名为${varName}的变量未找到`;
      return {result: 0, code, desc}
    } else {
      const isSame = first === last || Math.abs(first - last) < 1e-5;
      const isGreater = first > last;

      const result = isSame
      ? (['>=', '<='].includes(comp))
      : isGreater
      ? (['>=', '>'].includes(comp))
      : (['<=', '<'].includes(comp))

      const code = result ? 'SUCC' : 'WARN';

      return {result, code};
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

    if (varName in varsLocal){
      return varsLocal[varName];
    } else if (__COL_ALIASES[varName] in varsLocal) {
      // console.log('here');
      return varsLocal[__COL_ALIASES[varName]];
    } else {
      error.Var = {code: 'WARN_VAR_NOT_FOUND', varName};
      return 0;
    }
  }

Literal 'literal'
  = [A-Za-z&#\u3000-\u303F\u4E00-\u9FA5\uFF00-\uFFEF][A-Za-z0-9&#\u3000-\u303F\u4E00-\u9FA5\uFF00-\uFFEF_]* {
    return text();
  }

Real 'real number'
  = _ Integer ('.' Integer ([eE] [+-] Integer)?)? { return parseFloat(text());}

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
