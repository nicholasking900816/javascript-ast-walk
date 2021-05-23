import { JavascriptAst } from './JavascriptAst';
import { ExpectCloseMap, LiteratureType, canBePreffixStatement, IS_PARSING_CASE, IS_PARSING_TRY, IS_PARSING_DOWHILE, canBeConditionStatement, canBeValueStatements, canBeListStatement, IS_PARSING_CLASSDECLARATION, IS_PARSING_COMPUTE, IS_PARSING_IMPORT, canBeSuffixStatement, IS_PARSING_VARDECLARATION, IS_PARSING_FUNDECLARATION, NEED_PURE_IDENTIFIER, IS_PARSING_ACCESSPROP, IS_PARSING_SWITCH } from './constants';
import { Patterns } from "./patterns";
import { isIdentifierChar, isIdentifierStart, isNumberStart, isNumberCharCode, isHexCharCode, assertUnexpect } from "./javasriptAstParserUtil";
import { UnExpectStatement } from './statements/UnExpectStatement';
import { ImportStatement } from './statements/ImportStatement';
import { StringLiteratureStatement } from './statements/StringLiteratureStatement';
import { IdentifierLiteratureStatement } from './statements/IdentifierLiteratureStatement';
import { ComputeStatement } from './statements/ComputeStatement';
import { Statement } from './statements/Statement';
import { AccessProStatement } from './statements/AccessProStatement';
import { ComputeAccessStatement } from './statements/ComputeAccessStatement';
import { FunctionCallStatement } from './statements/FunctionCallStatement';
import { TernaryStatement } from './statements/TernaryStatement';
import { TemplateStringStatement } from './statements/TemplateStringStatement';
import { VariableDeclarationStatement } from './statements/VariableDeclarationStatement';
import { FunDeclarationStatement } from './statements/FunDeclarationStatement';
import { Block } from './Block';
import { CaseStatement } from './statements/CaseStatement';
import { TryCathchStatement } from './statements/TryCatchStatement';
import { KeyWordStatement } from './statements/KeyWordStatement';
import { DoWhileStatement } from './statements/DoWhileStatement';
import { WhileStatement } from './statements/WhileStatement';
import { ForLoopStatement } from './statements/ForLoopStatement';
import { ConditionStatement } from './statements/ConditionStatement';
import { ObjectLiteratureStatement } from './statements/ObjectLiteratureStatement';
import { ArrayLiteratureStatement } from './statements/ArrayLiteratureStatement';
import { UnitaryStatement } from './statements/UnitaryStatement';
import { SwitchStatement } from './statements/SwitchStatement';
import { WithStatement } from './statements/WithStatement';
import { NewStatement } from './statements/NewStatement';
import { ExportStatement } from './statements/ExportStatement';
import { BracketEnwrapStatement } from './statements/BracketEnwrapStatement';
import { CommontStatement } from './statements/CommentStatement';
import { ClassDeclarationStatement } from './statements/ClassDeclarationStatement';
import { AssignStatement } from './statements/AssignStatement';
import { OperatorStatement } from './statements/OperatorStatement';
import { ValueLiteratureStatement } from './statements/ValueLiteratureStatement';

export class JavascriptAstParsser {
  static nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  private pos = 0;
  private currentToken: any = {};
  private excutionFlag = 0;
  private startTokens: any[] = [];
  private stringStartToken: number;
  private tokens: any = [];
  private parsingStatement: Statement;
  private currentLine = 1;
  private isParsingFunDeclaration = false;
  private isParsingLoop = false;

  ast: JavascriptAst;
  
  private get expectCloseToken() {
    let lastStart = this.startTokens.length ? this.startTokens[this.startTokens.length - 1] : null;
    return ExpectCloseMap[lastStart];
  }
  private get curCharCode() {
    return this.input.charCodeAt(this.pos);
  }
  private get nextCharCode() {
    return this.input.charCodeAt(this.pos + 1);
  }

  private get curChar() {
    return this.input.charAt(this.pos);
  }
  
  constructor(private input: string) {

  }

  parse() {
    this.ast = new JavascriptAst();
    let topLevelBlock = this.ast.topLevelBlock;
    let count = 0;
    while(!this.isReadAll() && 1000000 > count++) {
      let statement = this.parseStatement();
      if (!statement) {
        if (this.currentToken.value === '{') {
          statement = this.parseObjLiteratureStatement()
        } else if (this.currentToken.value === '[') {
          statement = this.parseArrayLiteratureStatement()
        }
      }
      statement && topLevelBlock.body.push(statement as any)
    }
    return this.ast;
  }

  private isReadAll() {
    return this.pos >= this.input.length - 1;
  }

  private isLineEnd() {
    let pos = this.pos, line = this.currentLine;
    this.skipSpace();
    let curLine = this.currentLine;
    this.pos = pos;
    return curLine > (this.currentLine = line);
  }

  private advance(offset?: number) {
    this.pos = this.pos + (offset || 1 );
  }

  private markPos() {
    let pos = this.pos, token = this.currentToken, len = this.tokens.length, startTokens = this.startTokens.slice();
    return () => {
      this.pos = pos;
      this.currentToken = token;
      this.tokens.length = len;
      this.startTokens = startTokens;
    }
  }

  private skipSpace() {
    loop: while (!this.isReadAll()) {
      let ch = this.input.charCodeAt(this.pos)
      switch (ch) {
        case 32: case 160: //''
          ++this.pos
          break
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos
          }
        case 10: case 8232: case 8233:
          this.pos ++;
          this.currentLine ++;
          break
        default:
          if (ch > 8 && ch < 14) {
            ++this.pos
          } else {
            break loop
          }
      }
    }
  }

  private peekNextChar(peekLen = 1) {
    let pos = this.pos;
    this.skipSpace();
    let nextChar = this.input.slice(this.pos, this.pos + peekLen);
    this.pos = pos;
    return nextChar;
  }

  private consumeNextWordIfMatch(expect: string) {
    let reset = this.markPos();
    this.next();
    if (this.currentToken.value === expect) {
      return true
    } 
    reset();
    return false;
  }

  private consumeNextCharIfMatch(expect: string, peekLen: number = 1) {
    let pos = this.pos;
    this.skipSpace();
    if (this.input.slice(this.pos, this.pos + peekLen) === expect) {
      this.pos += peekLen;
      return true;
    } 
    this.pos = pos;
    return false;
  }

  private consumeStartTokenIfMatch(startToken) {
    let pos = this.pos;
    this.skipSpace();
    if (this.input.slice(this.pos, this.pos + 1) === startToken) {
      this.pos ++;
      this.startTokens.push(startToken);
      return true
    }
    this.pos = pos;
    return false;
  }

  private consumeCloseTokenIfMatch(closeToken) {
    let pos = this.pos;
    this.skipSpace();
    if (this.input.slice(this.pos, this.pos + 1) === closeToken) {
      this.pos ++;
      this.startTokens.pop();
      return true
    }
    this.pos = pos;
    return false;
  }

  private startParse(statement: Statement, excutionFlag?: number) {
    let prevParsingStatement = this.parsingStatement, prevIsParsingLoop = this.isParsingLoop, prevIsParsingFunDe = this.isParsingFunDeclaration;
    this.parsingStatement = statement;
    excutionFlag && (this.excutionFlag |= excutionFlag);
    return (expectExpressionEnd = true) => {
      if (expectExpressionEnd && !prevParsingStatement) {
        this.expectExpressionEnd();
      }
      statement.loc.end = this.pos;
      if (this.parsingStatement.type === 'FunDeclarationStatement') {
        this.isParsingFunDeclaration = false
      } else if (['ForLoopStatement', 'DoWhileStatement', 'WhileStatement', 'CaseStatement'].includes(this.parsingStatement.type)) {
        this.isParsingLoop = false;
      }
      this.parsingStatement = prevParsingStatement;
      this.isParsingLoop = prevIsParsingLoop;
      this.isParsingFunDeclaration = prevIsParsingFunDe;
      excutionFlag && (this.excutionFlag &= ~excutionFlag);
      return statement;
    }
  }

  private expectNextNullStatement(expectTokenValue: string | string[]) {
    expectTokenValue = typeof expectTokenValue === 'string' ? [expectTokenValue] : expectTokenValue;
    for(let value of expectTokenValue) {
      let statement = this.parseStatement();
      if (statement) {
        assertUnexpect(this.parsingStatement, statement, ()=> `expect ${expectTokenValue}`);
        return false;
      }
      if (this.currentToken.value !== value) {
        this.parsingStatement.unexpects.push(new UnExpectStatement(this.currentToken.value, `expect ${value}`, this.currentToken.loc))
        return false;
      } 
    }
    return true
  }

  private expectExpressionEnd() {
    while(true) {
      if (
        this.isReadAll() ||
        this.isLineEnd() ||
        this.expectNextNullStatement(';')
      ) break
    }
  }

  private parseStatement(context: any = {}) {
    if (this.isReadAll()) return null;
    this.next();
    if (this.currentToken.type === 'Keyword') {
      return this.parseIsStartWithKeyword();
    } else if (this.currentToken.type === 'ValueLiterature') {
      return new ValueLiteratureStatement(this.currentToken);
    } else if (this.currentToken.type === 'TemplateStrStart') {
      return this.parseTemplateStrStatement();
    } else if (this.currentToken.type && this.currentToken.type.indexOf('Literature') > -1) {
      let statement = new LiteratureType[this.currentToken.type](this.currentToken);
      if(this.excutionFlag & NEED_PURE_IDENTIFIER) return statement;
      if (statement.type === 'IdentifierLiteratureStatement') {
        return this.tryParseAssign(statement) || this.tryParse(statement)
      }
      return this.tryParse(statement);
    } else if (this.currentToken.type === 'Operator') {
      let operator = new OperatorStatement(this.currentToken);
      if(context.expectOperator) {
        return operator;
      } 
      return this.tryParsePrefixUnary(operator) || operator;
    } else if (this.currentToken.type === 'BlockStart') {
      this.startTokens.push(this.currentToken.value);
      return null;
    } else if (this.currentToken.type === 'BlockClose') {
      if (this.currentToken.value === this.expectCloseToken) {
        this.startTokens.pop();
        return null;
      } else {
        return new UnExpectStatement(this.currentToken.value, `unexpect token '${this.currentToken.value}'`, this.currentToken.loc)
      }
    } else if (this.currentToken.type === 'CommentStart') {
      return this.parseComment();
    } else {
      return null;
    }
  }

  private safeParseStatement() {
    let statement = this.parseStatement();
    if (!this.parsingStatement) {
      return statement;
    }
    if (assertUnexpect(this.parsingStatement, statement)) return null;
    return statement;
  }

  private parseStatementIfTypeMatch(expectStatementType: string | string[]) {
    let types = typeof expectStatementType === 'string' ? [expectStatementType] : expectStatementType;
    let statement = this.safeParseStatement();
    
    if (statement) {
      if(types.includes(statement.type)) return statement;
      this.parsingStatement.unexpects.push(new UnExpectStatement(statement, 'unexpect statement', this.currentToken.loc));
    } else {
      if (this.parsingStatement && this.parsingStatement.unexpects.length) return null;
      if (this.currentToken.value === '(' && expectStatementType.includes('BracketEnwrapStatement')) return this.parseBracketEnwrapStatement();
      if (this.currentToken.value === '{' && expectStatementType.includes('ObjectLiteratureStatement')) return this.parseObjLiteratureStatement();
      if (this.currentToken.value === '[' && expectStatementType.includes('ArrayLiteratureStatement')) return this.parseArrayLiteratureStatement();
      this.parsingStatement.unexpects.push(new UnExpectStatement(this.currentToken.value, `unexpect statement ${this.currentToken.value}`, this.currentToken.loc))
    }

    return null;
  }

  private tryParseStatementIfTypeMatch(expectStatementType: string | string[]) {
    let reset = this.markPos();
    let statement = this.parseStatement();

    expectStatementType = typeof expectStatementType === 'string' ? [expectStatementType] : expectStatementType;
    if (
      statement && 
      !statement.unexpects.length && 
      expectStatementType.includes(statement.type)
    ) return statement;
    reset();
    return null;
  }

  private next() {
    this.skipSpace();
    this.currentToken = {
      loc: {start: null, end: null}
    };
    this.currentToken.loc.start = this.pos;
    this.readWord();
    this.currentToken.loc.end = this.pos;
    this.tokens.push(Object.assign(this.currentToken));
    return this.currentToken;
  }

  private readWord() {
    if (isIdentifierStart(this.curCharCode)) {
      this.currentToken.value = this.readIdentifier();
      if (Patterns.keywords.test(this.currentToken.value)) {
        this.currentToken.type = 'Keyword'
      } else if (Patterns.valueLiterature.test(this.currentToken.value)) {
        this.currentToken.type = 'ValueLiterature'
      } else {
        this.currentToken.type = 'IdentifierLiterature'
      }
    } else if (isNumberStart(this.curCharCode)) {
      this.currentToken.type = 'NumberLiterature'
      this.currentToken.value = this.readNumber();
    } else if (this.curCharCode === 39 || this.curCharCode === 34) {
      this.currentToken.type = 'StringLiterature'
      this.currentToken.value = this.readString();  
      this.advance();
    } else if (this.input.slice(this.pos, this.pos + 2) === '//' || this.input.slice(this.pos, this.pos + 2) === '/*') {
      this.currentToken.type = 'CommentStart';
      this.currentToken.value = this.input.slice(this.pos, this.pos + 2);
      this.pos += 2;
    } else if (Patterns.operators.test(this.curChar)) {
      this.currentToken.type = 'Operator';
      this.currentToken.value = this.readOperator();
      this.currentToken.isAssignOperator = Patterns.assign.test(this.currentToken.value);
    } else {
        let start = this.pos;
        this.advance();
        this.currentToken.value = this.input.slice(start, this.pos);
        if (Patterns.blockStart.test(this.currentToken.value)) {
          this.currentToken.type = 'BlockStart';
        } else if (Patterns.blockClose.test(this.currentToken.value)) {
          this.currentToken.type = 'BlockClose'
        } else if (this.currentToken.value === '`') {
          this.currentToken.type = 'TemplateStrStart'
        }
    }
  }

  private readNumber() {
    let start = this.pos;
    this.consumeNumber();
    return this.input.slice(start, this.pos);
  }

  private consumeNumber() {
    if (this.curCharCode === 48) { // 0开头
      switch (this.nextCharCode) {
        case 98: // '0b'开头，二进制数
          this.advance(2);
          this.currentToken.type = 'BinaryNumberLiterature'
          this.consumeBinary();
          break;
        case 120: // '0x'开头, 16进制数
          this.advance(2);
          this.currentToken.type = 'HexNumberLiterature'
          this.consumeHex();
          break;
        default:
          this.consumeUnexpect([() => {}]);
      }
    } else {
      this.currentToken.type = 'NumberLiterature';
      let isReadingDecimal = false;
      while((isNumberCharCode(this.curCharCode) || this.curCharCode === 46) && !this.isReadAll()) { // 46 为 '.'
        if (this.curCharCode === 46) {
          if (isReadingDecimal) { // 一个nunber里不应有两个小数点
            this.consumeUnexpect([]);
            return;
          }
          isReadingDecimal = true;
        }
        this.advance();
      }
    }
  }

  private readString() {
    this.stringStartToken = this.curCharCode;
    this.advance();
    let start = this.pos;
    this.consumeString();
    return this.input.slice(start, this.pos);
  }

  private consumeString() {
    while(this.curCharCode !== this.stringStartToken && !this.isReadAll()) {
      this.advance();
    }
  }

  private readIdentifier() {
    let start = this.pos;  
    this.advance();
    this.consumeIdentifier();
    return this.input.slice(start, this.pos);
  }

  private consumeIdentifier() {
    while(isIdentifierChar(this.curCharCode)) {
      this.advance();
      if (this.isReadAll()) break;
    }
  }

  private readOperator() {
    let start = this.pos;
    if (
      Patterns.canReapeat.test(this.curChar) && this.nextCharCode === this.curCharCode ||
      Patterns.canPrefixAssign.test(this.curChar) && this.nextCharCode === 61 // '='
    ) {
      this.advance();
    } 
    if (this.curCharCode === 61 && this.nextCharCode === 61) {
      this.advance();
    }
    this.advance();
    return this.input.slice(start, this.pos);
  }

  private parseBlock(blockType, endCheck: Function = (statement: Statement) => this.currentToken.value === '}') {
    let block = new Block(blockType),
        prevContext = this.excutionFlag,
        prevParsingStatement = this.parsingStatement;
    this.excutionFlag = 0;
    this.parsingStatement = null;
    let statement = this.parseStatement();

    while(!endCheck(statement) && !this.isReadAll()) {
      if (!statement) {
        if (this.currentToken.value === '{') {
          statement = this.parseObjLiteratureStatement()
        } else if (this.currentToken.value === '[') {
          statement = this.parseArrayLiteratureStatement()
        }
      }
      statement && block.body.push(statement);
      statement = this.parseStatement();
    }

    this.excutionFlag = prevContext;
    this.parsingStatement = prevParsingStatement;
    return block;
  }

  // statement parse start
  private parseImportStatement() {
    let statement = this.tryParseFunctionCallStatement(new IdentifierLiteratureStatement(this.currentToken))
    if (statement) {
      return statement;
    } else {
        statement = new ImportStatement(this.currentToken);
        let endParse = this.startParse(statement, IS_PARSING_IMPORT);
        
        if(statement.from = this.tryParseStatementIfTypeMatch('StringLiteratureStatement')) return endParse();
        if (this.consumeNextCharIfMatch('{')) {
          statement.identifiers = this.getImportIdentifiers();
        } else if (
          statement.identifier.name = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')
        ) {
          if (
            this.consumeNextWordIfMatch('as') && 
            !(statement.identifier.as = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement'))
          ) {
             return endParse();
          } 
        } 

        if (
          statement.unexpects.length ||
          !this.expectNextNullStatement('from')
        ) return endParse();

        statement.from = this.parseStatementIfTypeMatch('StringLiteratureStatement');
        return endParse();
    }
  }

  private getImportIdentifiers() {
    let identifiers = [], expectComma = false;
    while(!this.consumeNextCharIfMatch('}') && !this.isReadAll()) {
      if (expectComma) {
        if (!this.expectNextNullStatement(',')) {
          break;
        }
      } else {
        let statement = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement');
        if (!statement) break;
        let identifier = {
          name: statement,
          as: null
        }
        if (this.consumeNextCharIfMatch(':') || this.consumeNextWordIfMatch('as')) {
          if (!(identifier.as = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement'))) {
            break;
          }
        }
        identifiers.push(identifier);
      }
      expectComma = !expectComma;
    }
    return identifiers;
  }

  private parseVarDeclarationStatement() {
    let statement: VariableDeclarationStatement = new VariableDeclarationStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_VARDECLARATION);
    let declaration: Statement;

    while(declaration = this.parseStatementIfTypeMatch(['IdentifierLiteratureStatement', 'AssignStatement'])) {
      statement.declarations.push(declaration);
      if (!this.consumeNextCharIfMatch(',')) {
        break
      }
    }

    return endParse();
  }

  private parseFunDeclarationStatement() {
    let statement: FunDeclarationStatement = new FunDeclarationStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_FUNDECLARATION);
    this.isParsingFunDeclaration = true;
    if (
      this.consumeStartTokenIfMatch('(') ||
      (statement.identifier = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) &&
      this.expectNextNullStatement('(')
    ) {
      let formalPara: IdentifierLiteratureStatement;
      if (!this.consumeNextCharIfMatch(')')) {
        while(
          formalPara = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')
        ) {
          statement.formalParas.push(formalPara);
          if (this.consumeNextCharIfMatch(')')) {
            break;
          } else if (this.expectNextNullStatement(',')) {
            continue;
          }
        }
      }
    }

    if(statement.unexpects.length) return endParse();

    if (this.expectNextNullStatement('{')) {
      statement.body = this.parseBlock('FunctionBody')
    }

    return endParse();
  }

  private parseObjLiteratureStatement() {
    let statement = new ObjectLiteratureStatement(this.currentToken);
    let endParse = this.startParse(statement);
    let key: Statement, value: Statement;
    while(key = this.parseStatementIfTypeMatch(['StringLiteratureStatement','IdentifierLiteratureStatement'])) {
      if (this.expectNextNullStatement(':') && (value = this.parseStatementIfTypeMatch(canBeValueStatements.concat(['FunDeclarationStatement'])))) {
        statement.properties.push({
          key: key as any,
          value: value
        });
        if (this.consumeCloseTokenIfMatch('}') || !this.expectNextNullStatement(',')) {
          break
        }
      } else {
        break;
      }
    }
    return endParse();
  }

  private parseArrayLiteratureStatement() {
    let statement = new ArrayLiteratureStatement(this.currentToken);
    let endParse = this.startParse(statement);
    let value: Statement;
    if (this.consumeCloseTokenIfMatch(']')) return endParse();
    while(value = this.parseStatementIfTypeMatch(canBeValueStatements.concat(['FunDeclarationStatement']))) {
      statement.items.push(value);
      if (this.consumeCloseTokenIfMatch(']') || !this.expectNextNullStatement(',')) {
        break;
      }
    }
    return endParse();
  }

  private parseTryCatchStatment() {
    let statement = new TryCathchStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_TRY);

    if (!this.expectNextNullStatement('{')) {
      return endParse()
    }

    statement.tryBody = this.parseBlock('TryBody');

    if(this.consumeNextWordIfMatch('catch')) {
      let catchCallback = this.parseFunDeclarationStatement() as FunDeclarationStatement;
      if (catchCallback.unexpects.length) {
        statement.unexpects.push(catchCallback)
        return endParse();
      } 
      statement.catchCallback = catchCallback;
    }

    if(this.consumeNextWordIfMatch('finally') && this.expectNextNullStatement('{')) {
      statement.finnalBody = this.parseBlock('FinnalBlock');
    }

    if (!statement.catchCallback && !statement.finnalBody) statement.unexpects.push(
      new UnExpectStatement(this.currentToken.value, 'expect finally', this.currentToken.loc) 
    )

    return endParse();
  }

  private parseDoWihleStatement() {
    let statement = new DoWhileStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_DOWHILE);
    this.isParsingLoop = true;
    if (!this.expectNextNullStatement('{')) return endParse();
    statement.doBody = this.parseBlock('DoBody');

    this.expectNextNullStatement('while') && 
    this.expectNextNullStatement('(') &&
    (statement.whileCondition = this.parseStatementIfTypeMatch(canBeConditionStatement)) && 
    this.expectNextNullStatement(')') 

    return endParse();
  }

  private parseWhileStatment() {
    let statement: WhileStatement = new WhileStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_SWITCH);
    this.isParsingLoop = true;

    if (
      this.expectNextNullStatement('(') &&
      (statement.whileCondition = this.parseStatementIfTypeMatch(canBeConditionStatement)) && 
      this.expectNextNullStatement(')') &&
      this.expectNextNullStatement('{')
    ) {
      statement.whileBody = this.parseBlock('WhileBody')
    }

    return endParse();
  }

  private parseForLoopStatement() {
    let statement = new ForLoopStatement(this.currentToken);
    let endParse = this.startParse(statement), isForIn = false;
    this.isParsingLoop = true;
    if (!this.expectNextNullStatement('(')) return endParse();

    if (!this.consumeNextCharIfMatch(';')) {
      let part1 = this.parseStatementIfTypeMatch(canBeValueStatements.concat(['VariableDeclarationStatement', 'FunDeclarationStatement']));
      if (!part1) {
        return endParse()
      } else if (
        part1.type === 'IdentifierLiteratureStatement' ||
        part1.type === 'VariableDeclarationStatement' && 
        part1.declarations.length === 1 && 
        part1.declarations[0].type !== 'AssignStatement'
      ) {
        if (
          this.consumeNextWordIfMatch('of') ||
          (isForIn = this.consumeNextWordIfMatch('in'))
        ) {
          statement.item = part1;
          if (
            ( 
              isForIn ? statement.forIn = this.parseStatementIfTypeMatch(canBeListStatement) : 
              statement.forOf = this.parseStatementIfTypeMatch(canBeListStatement)
            ) && 
            this.expectNextNullStatement(')') &&
            this.expectNextNullStatement('{')
          ) {
            statement.body = this.parseBlock('ForLoopBody');
          }
          return endParse()
        }
      }
      statement.part1 = part1;
      if (!this.expectNextNullStatement(';')) return endParse();
    }

    if (
      !this.consumeNextCharIfMatch(';') && 
      !(statement.part2 = this.parseStatementIfTypeMatch(canBeConditionStatement)) &&
      !this.expectNextNullStatement(';')
    ) {
      return endParse()
    }

    if (
      this.consumeNextCharIfMatch(')') ||
      (statement.part3 = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
      this.expectNextNullStatement(')') 
    ) {
      if (this.expectNextNullStatement('{')) statement.body = this.parseBlock('ForLoopBody')
    }
    
    return endParse()
  }

  private parseConditionStatement() {
    let statement = new ConditionStatement(this.currentToken);
    let endParse = this.startParse(statement);
    let expectLineEnd = false;

    let parseConditionBlock = () => {
      if (this.consumeNextCharIfMatch('{')) {
        return this.parseBlock('ConditionBlock')
      } else {
        expectLineEnd = true;
        let currentLine = this.currentLine;
        let reset = this.markPos();
        let block = new Block('ConditionBlock');
        if (this.consumeNextWordIfMatch('else')) {
          if (currentLine === this.currentLine) {
            statement.unexpects.push(new UnExpectStatement('else', 'statement expect', this.currentToken.loc));
            return null;
          }
          reset();
          return block;
        } else if (this.consumeNextCharIfMatch(';')) {
          reset();
          return block;
        }

        let nextStatement = this.safeParseStatement();
        if (nextStatement) {
          block.body.push(nextStatement)
        }
        return block;
      }
    }
    
    if (
      !this.expectNextNullStatement('(') ||
      !(statement.if.condition = this.parseStatementIfTypeMatch(canBeConditionStatement)) ||
      !this.expectNextNullStatement(')') 
    ) {
      return endParse()
    }

    statement.if.body = parseConditionBlock();

    if(statement.unexpects.length || expectLineEnd && !this.isLineEnd()) return endParse();
    expectLineEnd = false;

    while(this.consumeNextWordIfMatch('else')) {
      if (this.consumeNextWordIfMatch('if')) {
        let elseIf = {
          condition: null,
          body: null
        }
        if (
          this.expectNextNullStatement('(') &&
          (elseIf.condition = this.parseStatementIfTypeMatch(canBeConditionStatement)) &&
          this.expectNextNullStatement(')')
        ) {
          elseIf.body = parseConditionBlock();
          statement.elseIf.push(elseIf);
          if (statement.unexpects.length) break;
          continue;
        } 
        break;
      }
      statement.else = parseConditionBlock();
      break;
    }
    return endParse(); 
  }

  private parseReturnStatement() {
    debugger;
    let statement = new UnitaryStatement(this.currentToken);
    if (!this.isParsingFunDeclaration) return new UnExpectStatement(statement, 'A "return" statement can only be used within a function body')
    let endParse = this.startParse(statement);

    if (!this.isLineEnd() && this.peekNextChar() !== ';') {
      statement.target = this.parseStatementIfTypeMatch(canBeValueStatements);
    }
    
    return endParse();
  }

  private parseSwitchStatement() {
    let statement = new SwitchStatement(this.currentToken);
    let endParse = this.startParse(statement);
    let caseStatement: Statement;
    
    if (!(
      this.expectNextNullStatement('(') &&
      (statement.beCompared = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
      this.expectNextNullStatement([')', '{'])
    )) return endParse()

    while(!this.consumeCloseTokenIfMatch('}')) {
      if (caseStatement = this.parseCaseStatement()) {
        if (caseStatement.unexpects.length) {
          statement.unexpects.push(caseStatement);
          break;
        }
        statement.case.push(caseStatement as CaseStatement)
      } else {
        break
      }
    }

    return endParse();
  }

  private parseCaseStatement() {
    if (
      !this.consumeNextWordIfMatch('case') &&
      !this.consumeNextWordIfMatch('default') 
    ) {
      this.next();
      this.parsingStatement.unexpects.push(new UnExpectStatement(this.currentToken.value, 'expect "case" or "default"', this.currentToken.loc))
      return null
    }

    let statement = new CaseStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_CASE)
    this.isParsingLoop = true;
    statement.isDefault = this.currentToken.value === 'default'

    if (!statement.isDefault && !(statement.condition = this.parseStatementIfTypeMatch(canBeConditionStatement))) {
      return endParse();
    }

    if (this.expectNextNullStatement(':')) {
      if (this.consumeStartTokenIfMatch('{')) {
        statement.body = this.parseBlock('CaseBody')
      } else {
        let reset = this.markPos()
        statement.body = this.parseBlock('CaseBody', (statement) => {
          if (
            (!statement || statement.type === 'KeyWordStatement') &&
            ['case', 'default', '}'].includes(this.currentToken.value)
          ) {
            reset();
            return true;
          } else {
            reset = this.markPos();
          }
        })
      }
    }

    return endParse();
  }

  private parseThrowStatement() {
    let statement = new UnitaryStatement(this.currentToken);
    let endParse = this.startParse(statement);
    statement.target = this.parseStatementIfTypeMatch(canBeValueStatements);
    return endParse();
  }

  private parseWithStatement() {
    let statement = new WithStatement(this.currentToken);
    let endParse = this.startParse(statement);
    if (
      this.expectNextNullStatement('(') &&
      (statement.withContext = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
      this.expectNextNullStatement(')') &&
      this.expectNextNullStatement('{')
    ) {
      statement.body = this.parseBlock('WithContextBlock');
    }
    return endParse();
  }

  private parseDeleteStatement() {
    let statement = new UnitaryStatement(this.currentToken);
    let endParse = this.startParse(statement);
    statement.target = this.parseStatementIfTypeMatch(['AccessProStatement', 'ComputeAccessStatement']);
    return endParse();
  }

  private parseNewStatement() {
    let statement = new NewStatement(this.currentToken);
    let endParse = this.startParse(statement);
    statement.constructorCallee = this.parseStatementIfTypeMatch(['FunctionCallStatement', 'IdentifierLiteratureStatement']);
    return endParse();
  }

  private parseClassDeclarationStatement() {
    let statement = new ClassDeclarationStatement(this.currentToken);
    let endParse = this.startParse(statement, IS_PARSING_CLASSDECLARATION);

    if (
      !(statement.className = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) ||
      this.consumeNextWordIfMatch('extends') && 
      !(statement.extend = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) ||
      !this.expectNextNullStatement('{')
    ) {
      return endParse();
    }

    while(!this.consumeCloseTokenIfMatch('}') && !this.isReadAll()) {
      let method = this.parseClassMehod();
      if(!method) return endParse();
      statement.methods.push(method as FunDeclarationStatement);
    }
    return endParse();
  }

  private parseClassMehod() {
    let reset = this.markPos();
    this.next();
    if (this.currentToken.type !== 'IdentifierLiterature') {
      this.parsingStatement.unexpects.push(new UnExpectStatement(
        this.currentToken.value,
        'expect identifier',
        this.currentToken.loc
      ))
      return null;
    }
    reset();
    let statement = this.parseFunDeclarationStatement();
    if (statement.unexpects.length) {
      this.parsingStatement.unexpects.push(statement);
      return null
    } 
    return statement;
  }

  private parseExportStatement() {
    let statement = new ExportStatement(this.currentToken);
    let endParse = this.startParse(statement);

    if (this.consumeNextCharIfMatch('{')) {
      let identifier: IdentifierLiteratureStatement;
      while(identifier = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) {
        let exportContent = {
          name: identifier,
          as: null
        }
        if (this.consumeNextWordIfMatch('as')) {
          if (exportContent.as = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) {
            statement.exportContent.push(exportContent)
          } else {
            return endParse();
          }
        }
        if (this.consumeNextCharIfMatch('}')) break;
        if (!this.expectNextNullStatement(',')) return endParse();
      }
    } else {
      let identifier: Statement = this.parseStatementIfTypeMatch(['IdentifierLiteratureStatement', 'VariableDeclarationStatement']);
      let asStatement: Statement;
      if (identifier) {
        if (identifier.type === 'VariableDeclarationStatement') {
           statement.exportContent.push(identifier);
           return endParse();
        }
        if (this.consumeNextWordIfMatch('as') && !(asStatement = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement'))) {
          return endParse();
        }
        statement.exportContent.push({
          name: identifier,
          as: asStatement
        })
      } else {
        return endParse();
      }
      
    }

    this.expectNextNullStatement('from') &&
    (statement.from = this.parseStatementIfTypeMatch('StringLiteratureStatement'))

    return endParse();
  }

  private parseTypeOfStatement() {
    let statement = new UnitaryStatement(this.currentToken);
    let endParse = this.startParse(statement);
    statement.target = this.parseStatementIfTypeMatch(canBeValueStatements);
    return endParse();
  }

  private parseTemplateStrStatement() {
    let statement: TemplateStringStatement = new TemplateStringStatement();
    let endParse = this.startParse(statement)
    let consumeString = () => {
      while(this.curCharCode !== 96 && this.input.slice(this.pos + 1, this.pos + 3) !== '${') {
        this.advance();
      }
    }
    while(this.curCharCode !== 96) {
      let start = this.pos;
      consumeString();
      statement.content.push(new StringLiteratureStatement(this.input.slice(start, this.pos)));
      if (this.curCharCode === 96) break;
      this.startTokens.push('{');
      let value: Statement;
      if(
        (value = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
        this.expectNextNullStatement('}')
      ) {
        statement.content.push(value);
        continue;
      }
      break;
    }
    return endParse();
  }

  private parseBracketEnwrapStatement() {
    let statement: BracketEnwrapStatement = new BracketEnwrapStatement(this.currentToken);
    let endParse = this.startParse(statement);
    let excutionFlag = this.excutionFlag;
    this.excutionFlag = 0;

    if (
      (statement.statement = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
      this.expectNextNullStatement(')')
    ) {
      return this.tryParse(endParse(false))
    }
    this.excutionFlag = excutionFlag;
    return endParse();
  }

  private tryParse(statement: Statement) {
    let resultStatement = this.tryParseTernary(statement) || this.tryParseSuffixUnary(statement) || this.tryParseAccessPropStatement(statement) || 
      this.tryParseComputeAccessStatement(statement) || 
      this.tryParseFunctionCallStatement(statement) || this.parseComputeStatement(statement) || statement;
    if (resultStatement === statement && !this.parsingStatement) {
      this.parsingStatement = statement;
      this.expectExpressionEnd();
      this.parsingStatement = null;
    } 
    return resultStatement; 
  }

  private tryParseTernary(condition: Statement) {
    if (!this.consumeNextCharIfMatch('?')) {
      return null;
    }
    let statement: TernaryStatement = new TernaryStatement(condition);
    let endParse = this.startParse(statement);

    (statement.trueStatement = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
    this.expectNextNullStatement(':') &&
    (statement.falseStatement = this.parseStatementIfTypeMatch(canBeValueStatements))

    return endParse();
  }

  private tryParseAccessPropStatement(propOwener: Statement) {
    if (!this.consumeNextCharIfMatch('.')) return null// '.';
    let statement = new AccessProStatement(propOwener);
    let endParse = this.startParse(statement, IS_PARSING_ACCESSPROP);
    if(statement.propertyName = this.parseStatementIfTypeMatch('IdentifierLiteratureStatement')) {
      let resultStatement = endParse(false);
      return this.tryParseAssign(resultStatement) || this.tryParse(resultStatement);
    }
    return endParse();
  }

  private tryParseComputeAccessStatement(propOwener: Statement) {
    if (!this.consumeStartTokenIfMatch('[')) return null;
    let statement = new ComputeAccessStatement(propOwener);
    let endParse = this.startParse(statement);

    if(
      (statement.propertyName = this.parseStatementIfTypeMatch(canBeValueStatements)) &&
      this.consumeCloseTokenIfMatch(']')
    ) {
      let resultStatement = endParse(false);
      return this.tryParseAssign(resultStatement) || this.tryParse(resultStatement);
    }
    
    return endParse();
  }

  private tryParseFunctionCallStatement(fnName: Statement) {
    if (!this.consumeStartTokenIfMatch('(')) return null;    
    let statement = new FunctionCallStatement(fnName);
    let endParse = this.startParse(statement);

    if (!this.consumeCloseTokenIfMatch(')')) {
      while(true) {
        let nextStatement: Statement = this.parseStatementIfTypeMatch(canBeValueStatements);
        if (statement) {
          statement.arguments.push(nextStatement);
        } else {
          return endParse();
        }
        if (this.consumeCloseTokenIfMatch(')')) break;
        if (!this.expectNextNullStatement(',')) return endParse();
      }
    }
  
    return this.tryParse(endParse(false));
  }

  private tryParsePrefixUnary(operator: OperatorStatement) {
    if (operator.isAssignOperator) return null;
    if (!Patterns.unaryOperator.test(operator.operator)) {
      return new UnExpectStatement(operator, 'unexpect operator')
    }

    let endParse = this.startParse(operator);
    let statement: Statement = this.parseStatementIfTypeMatch(canBePreffixStatement);
    if (operator.unexpects.length) return endParse();
    statement.prefix = operator;
    return statement;
  }

  private tryParseSuffixUnary(curStatement: Statement) {
    if (!canBeSuffixStatement.includes(curStatement.type)) return null;
    let reset = this.markPos();
    this.next()
    if (!Patterns.canBeSuffixUnary.test(this.currentToken.value)) {
      reset();
      return null;
    }
    let endParse = this.startParse(curStatement);
    curStatement.suffix = new OperatorStatement(this.currentToken);
    return endParse();
  }

  private tryParseAssign(identifier: Statement) {
    let reset = this.markPos();
    this.next();
    if (!this.currentToken.isAssignOperator) {
      reset();
      return null;
    } 

    let statement = new AssignStatement(this.currentToken);
    let endParse = this.startParse(statement);
    statement.left = identifier as IdentifierLiteratureStatement;
    if (this.excutionFlag & IS_PARSING_VARDECLARATION && this.currentToken.value !== '=') {
      statement.unexpects.push(new UnExpectStatement(new OperatorStatement(this.currentToken), 'expect "="'));
      return endParse();
    }
    statement.operator = new OperatorStatement(this.currentToken);
    statement.right = this.parseStatementIfTypeMatch(canBeValueStatements);
    return endParse();
  }

  private parseComputeStatement(first: Statement) {
    if (this.excutionFlag & IS_PARSING_COMPUTE || !Patterns.operators.test(this.peekNextChar())) return first;
    let expectOperator = false;
    let lastComputeStatement: ComputeStatement;
    let operationStatement: ComputeStatement = lastComputeStatement = new ComputeStatement(this.parseStatement({expectOperator: true}) as OperatorStatement, first); 
    let endParse = this.startParse(operationStatement, IS_PARSING_COMPUTE);

    let curStatement: Statement = this.parseStatementIfTypeMatch(canBeValueStatements);
    let comparePriorityAndInsert = (op1: ComputeStatement, op2: ComputeStatement, parent?: ComputeStatement) => {
      if (op1.operator.priority < op2.operator.priority) {
        if (op1.right.type === 'ComputeStatement') {
          comparePriorityAndInsert(op1.right as ComputeStatement, op2, op1);
        } else {
          op2.left = op1.right;
          op1.right = op2;
        }
      } else {
        op2.left = op1;
        if (parent) {
          parent.right = op2;
        } else {
          operationStatement = op2;
          endParse();
          endParse = this.startParse(operationStatement, IS_PARSING_COMPUTE);
        }
      }
    }

    let setComputeStatementLoc = (computeStatement: ComputeStatement) => {
      if (computeStatement.left.type === 'ComputeStatement') setComputeStatementLoc(computeStatement.left);
      computeStatement.loc.start = computeStatement.left.loc.start;
      if (computeStatement.right) {
        if (computeStatement.right.type === 'ComputeStatement') setComputeStatementLoc(computeStatement.right); 
        computeStatement.loc.end = computeStatement.right.loc.end;
      }
    }

    while(curStatement) {
      if (expectOperator) {
        let computeStatement: ComputeStatement = new ComputeStatement(curStatement as OperatorStatement);
        comparePriorityAndInsert(operationStatement, computeStatement);
        lastComputeStatement = computeStatement;
      } else if(lastComputeStatement) {
        lastComputeStatement.right = curStatement;
      }

      expectOperator = !expectOperator;

      if (expectOperator) {
        if (this.isLineEnd()) break;
        curStatement = this.tryParseStatementIfTypeMatch('OperatorStatement')
      } else {
        curStatement = this.parseStatementIfTypeMatch(canBeValueStatements)
      }     
    }
    setComputeStatementLoc(operationStatement);
    return endParse();
  }
 
  private parseIsStartWithKeyword() {
    let statement, endParse;
    switch(this.currentToken.value) {
      case 'import':
        return this.parseImportStatement();
      case 'let':
      case 'const':
      case 'var':  
        return this.parseVarDeclarationStatement();
      case 'function':    
        return this.parseFunDeclarationStatement();
      case 'try':
        return this.parseTryCatchStatment();
      case 'do':
        return this.parseDoWihleStatement();
      case 'while':
        if (this.excutionFlag & IS_PARSING_DOWHILE) {
          return null;
        }
        return this.parseWhileStatment();
      case 'for':
        return this.parseForLoopStatement();  
      case 'if':
        return this.parseConditionStatement();
      case 'else':
        statement = new ConditionStatement(this.currentToken);
        endParse = this.startParse(statement);
        statement.unexpects.push(new UnExpectStatement(this.currentToken.value, 'expect "if"', this.currentToken.loc));
        return endParse();
      case 'return':
        return this.parseReturnStatement();
      case 'switch':
        return this.parseSwitchStatement();
      case 'throw':
        return this.parseThrowStatement();
      case 'with':
        return this.parseWithStatement();
      case 'delete':  
        return this.parseDeleteStatement();
      case 'typeof':
        return this.parseTypeOfStatement();
      case 'new':
        return this.parseNewStatement();  
      case 'class':
        return this.parseClassDeclarationStatement();
      case 'export':
        return this.parseExportStatement();  
      case 'as':
        return null;  
      case 'from':
        if (this.excutionFlag & IS_PARSING_IMPORT) {
          return null;
        }
        return new UnExpectStatement(new KeyWordStatement(this.currentToken), 'expect import', this.currentToken.loc);
      case 'case':
      case 'default':
        return new KeyWordStatement(this.currentToken)  
      case 'catch':
      case 'finnaly':
        statement = new TryCathchStatement(this.currentToken);
        endParse = this.startParse(statement);
        statement.unexpects.push(new UnExpectStatement(this.currentToken.value, 'expect "if"', this.currentToken.loc));
        return endParse();
      default:
        return new KeyWordStatement(this.currentToken);
    }
  }

  private parseComment() {
    if (this.currentToken.value === '//') {
      return this.parseBlockComment();
    } else {
      return this.parseLineComment();
    }
  }

  private parseBlockComment() {
    let statement = new CommontStatement(this.currentToken);
    let endParse = this.startParse(statement);
    while(!this.consumeNextCharIfMatch(String.fromCharCode(10))) {
      this.advance();
    }
    statement.content = this.input.slice(statement.loc.start, this.pos);
    return endParse()
  }

  private parseLineComment() {
    let statement = new CommontStatement(this.currentToken);
    let endParse = this.startParse(statement);
    while(!this.consumeNextCharIfMatch('*/', 2)) {
      this.advance();
    }
    statement.content = this.input.slice(statement.loc.start, this.pos);
    return endParse()
  }

  private consumeBinary() {
    while(this.curCharCode >= 48 && this.curCharCode <= 49 && !this.isReadAll()) {
      this.advance()
    }
  }

  private consumeHex() {
    while(isHexCharCode(this.curCharCode) && !this.isReadAll()) {
      this.advance();
    }
  }

  private consumeUnexpect(stopTest: Function[]) {
    while(!stopTest.some(testFn => testFn(this.curCharCode)) && !this.isReadAll()) {
        this.advance();
    }
  }
};