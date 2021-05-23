import { IdentifierLiteratureStatement } from "./statements/IdentifierLiteratureStatement";
import { NumberLiteratureStatement } from "./statements/NumberLiteratureStatement";
import { StringLiteratureStatement } from "./statements/StringLiteratureStatement";

export const IS_PARSING_COMPUTE = 0b1;
export const IS_PARSING_CASE = 0b10;
export const IS_PARSING_TRY = 0b100;
export const IS_PARSING_DOWHILE = 0b1000;
export const IS_PARSING_CLASSDECLARATION = 0b10000;
export const IS_PARSING_IMPORT = 0b100000;
export const IS_PARSING_VARDECLARATION = 0b1000000;
export const IS_PARSING_FUNDECLARATION = 0b10000000;
export const IS_PARSING_ACCESSPROP = 0b100000000;
export const IS_PARSING_SWITCH = 0b1000000000;

export const NEED_PURE_IDENTIFIER = IS_PARSING_FUNDECLARATION | IS_PARSING_ACCESSPROP;

export const TokenName = {
  Backquote: '`',
  BracketL: '[',
  BracketR: ']',
  ParenL: '(',
  ParenR: ')',
  BraceL: '{',
  BraceR: '}'
}

export const LiteratureType = {
  'IdentifierLiterature': IdentifierLiteratureStatement,
  'StringLiterature': StringLiteratureStatement,
  'BinaryNumberLiterature': NumberLiteratureStatement,
  'HexNumberLiterature': NumberLiteratureStatement,
  'NumberLiterature': NumberLiteratureStatement
}

export const canBeConditionStatement = [
  'AccessProStatement',
  'ArrayLiteratureStatement',
  'AssignStatement',
  'ComputeAccessStatement',
  'ComputeStatement',
  'FunctionCallStatement',
  'IdentifierLiteratureStatement',
  'NumberLiteratureStatement',
  'StringLiteratureStatement',
  'TemplateStringStatement',
  'TernaryStatement',
  'ObjectLiteratureStatement',
  'ValueLiteratureStatement',
  'BracketEnwrapStatement',
  'NewStatement'
]

export const canBeValueStatements = [
  'AccessProStatement',// o
  'ArrayLiteratureStatement',//o
  'AssignStatement',//o
  'ComputeAccessStatement',
  'ComputeStatement',
  'FunctionCallStatement',
  'FunDeclarationStatement',//o
  'IdentifierLiteratureStatement',//o
  'NumberLiteratureStatement',
  'ObjectLiteratureStatement',//o
  'StringLiteratureStatement',
  'TemplateStringStatement',
  'TernaryStatement',
  'BracketEnwrapStatement',//o
  'ValueLiteratureStatement',
  'NewStatement'//o
]

export const canBeListStatement = [
  'ArrayLiteratureStatement',
  'AssignStatement',
  'AccessProStatement',
  'ComputeAccessStatement',
  'FunctionCallStatement',
  'IdentifierLiteratureStatement',
  'TernaryStatement',
]

export enum BlockType {
  ModuleBlock,
  FunctionBlock,
  BracesBlock,
  bracketsBlock,
  ParenBlock
}

export const priorityMap = {
  '+': 14,
  '-': 14,
  '*': 15,
  '/': 15
}

export const canBeComputeStatementTypes = [
  'IdentifierLiteratureStatement', 
  'NumberLiteratureStatement', 
  'StringLiteratureStatement', 
  'ComputeStatement'
]

export const canBeSuffixStatement = [
  'IdentifierLiteratureStatement',
  'AccessProStatement',
  'ComputeAccessStatement'
]

export const canBePreffixStatement = [
  ...canBeSuffixStatement,
  'FunctionCallStatement',
  'StringLiteratureStatement',
  'NumberLiteratureStatement'
];

export const ExpectCloseMap = {
  '[': ']',
  '(': ')',
  '"': '"',
  '\'': '\'',
  '{': '}',
  '\`': '\`',
  '\/': '\/'
}
