{
	var parserInstance = this;
    
  var {Sheets, get, outer} = parserInstance;

  var {__PATH_ALIASES={}} = Sheets;

  var suggPathSeg = (seg) => __PATH_ALIASES[seg] || [seg];

  var error = {};

}

PathExpr
  = SheetName ":" suggs:Path {
    let {Data, Path} = error;

    let code, result = 0;
    if (Data) {
      code = Data;
    } else if (Path && !Path.startsWith('INFO')){
      console.log(Path, 'path error');
      code = Path;
    } 
    return { suggs, result, code }
  }

SheetName
  = Literal {
    const name = text();

    if(Sheets[name] === undefined){
      error.Data = 'WARN_SHEET_NOT_EXISTS';
    } else {
      return name;
    }
  }

Path
  = head:Literal tail:("/" Literal)* {

    // By here we did the parsing
    if (error.Data) {
      error.Path = error.Data;
      return;
    }

    const path = tail.reduce((result, elem) => {
      return result.concat(elem[1]);
    }, [head]);

    const {data, indexColumn} = Sheets[sheetName];

    let {record, siblings} = get(data, {path, indexColumn})

    const candidatePaths = outer(suggPathSeg(path));

    for (let candiPath of candidatePaths){
      let {record, siblings} = get(data, {path: candiPath, indexColumn})
      if (record !== undefined){
        error.Path = 'INFO_ALTER_PATH';
        return {
          record,
          suggs: siblings.map(({[indexColumn]:col}) => col);
        };
      }
    }

    error.Path = 'WARN_RECORD_NOT_FOUND';

    return {
      record, 
      suggs: siblings.map(({[indexColumn]:col}) => col)
    };
  }

Literal 'literal'
  = [A-Za-z&#\u3000-\u303F\u4E00-\u9FA5\uFF00-\uFFEF][A-Za-z0-9&#\u3000-\u303F\u4E00-\u9FA5\uFF00-\uFFEF_]* {
    return text();
  }

_ "whitespace"
  = [ \t\n\r]*