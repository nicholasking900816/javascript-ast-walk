import { Block } from "./lib/javascript-ast-parser/Block";
import { AccessProStatement } from "./lib/javascript-ast-parser/statements/AccessProStatement";
import { ArrayLiteratureStatement } from "./lib/javascript-ast-parser/statements/ArrayLiteratureStatement";
import { AssignStatement } from "./lib/javascript-ast-parser/statements/AssignStatement";
import { BracketEnwrapStatement } from "./lib/javascript-ast-parser/statements/BracketEnwrapStatement";
import { CaseStatement } from "./lib/javascript-ast-parser/statements/CaseStatement";
import { ClassDeclarationStatement } from "./lib/javascript-ast-parser/statements/ClassDeclarationStatement";
import { ComputeAccessStatement } from "./lib/javascript-ast-parser/statements/ComputeAccessStatement";
import { ComputeStatement } from "./lib/javascript-ast-parser/statements/ComputeStatement";
import { ConditionStatement } from "./lib/javascript-ast-parser/statements/ConditionStatement";
import { DoWhileStatement } from "./lib/javascript-ast-parser/statements/DoWhileStatement";
import { ForLoopStatement } from "./lib/javascript-ast-parser/statements/ForLoopStatement";
import { FunctionCallStatement } from "./lib/javascript-ast-parser/statements/FunctionCallStatement";
import { FunDeclarationStatement } from "./lib/javascript-ast-parser/statements/FunDeclarationStatement";
import { IdentifierLiteratureStatement } from "./lib/javascript-ast-parser/statements/IdentifierLiteratureStatement";
import { ImportStatement } from "./lib/javascript-ast-parser/statements/ImportStatement";
import { NewStatement } from "./lib/javascript-ast-parser/statements/NewStatement";
import { ObjectLiteratureStatement } from "./lib/javascript-ast-parser/statements/ObjectLiteratureStatement";
import { Statement } from "./lib/javascript-ast-parser/statements/Statement";
import { SwitchStatement } from "./lib/javascript-ast-parser/statements/SwitchStatement";
import { TemplateStringStatement } from "./lib/javascript-ast-parser/statements/TemplateStringStatement";
import { TernaryStatement } from "./lib/javascript-ast-parser/statements/TernaryStatement";
import { TryCathchStatement } from "./lib/javascript-ast-parser/statements/TryCatchStatement";
import { UnitaryStatement } from "./lib/javascript-ast-parser/statements/UnitaryStatement";
import { VariableDeclarationStatement } from "./lib/javascript-ast-parser/statements/VariableDeclarationStatement";
import { WhileStatement } from "./lib/javascript-ast-parser/statements/WhileStatement";
import { WithStatement } from "./lib/javascript-ast-parser/statements/WithStatement";
import { ClassScope } from "./scope/ClassScope";
import { JavascriptScope } from "./scope/JavascriptScope";
import { ValueDesc } from "./scope/VariableDesc";

export function walk(block: Block, parent?: JavascriptScope) {
    let scope = prewalk(block, parent);
    block.body.forEach((statement: Statement) => {
        switch(statement.type) {
            case 'VariableDeclarationStatement':
                walkVariableDeclarationStatement(statement as VariableDeclarationStatement, scope);
                break;
            case 'ArrayLiteratureStatement':
                walkArray(statement as ArrayLiteratureStatement, scope);
                break;
            case 'AssignStatement':
                walkAssignStatement(statement as AssignStatement, scope);
                break;
            case 'BracketEnwrapStatement':
                walkBracketEnwrap(statement as BracketEnwrapStatement, scope);
                break;
            case 'ClassDeclarationStatement':
                walkClassDeclaration(statement as ClassDeclarationStatement, scope);
                break;
            case 'ComputeStatement':
                walkComputeStatement(statement as ComputeStatement, scope);
                break;
            case 'ConditionStatement':
                walkCondition(statement as ConditionStatement, scope);
                break;
            case 'DoWhileStatement':
                walkDoWhile(statement as DoWhileStatement, scope);
                break;
            case 'ForLoopStatement':
                walkForLoop(statement as ForLoopStatement, scope);
                break;
            case 'FunctionCallStatement':
                walkFunCall(statement as FunctionCallStatement, scope);
                break;
            case 'FunDeclarationStatement':
                walkFunDeclaration(statement as FunDeclarationStatement, scope);
                break;
            case 'ImportStatement':
                break;
            case 'NewStatement':
                walkNew(statement as NewStatement, scope);     
                break;
            case 'ObjectLiteratureStatement':
                walkObj(statement as ObjectLiteratureStatement, scope);
                break;
            case 'SwitchStatement':
                walkSwitch(statement as SwitchStatement, scope);
                break;
            case 'TemplateStringStatement':
                walkTemplateString(statement as TemplateStringStatement, scope);
                break;
            case 'TernaryStatement':
                walkTernary(statement as TernaryStatement, scope);
                break;
            case 'TryCathchStatement':
                walkTryCatch(statement as TryCathchStatement, scope);
                break;
            case 'UnitaryStatement':
                walkUnitary(statement as UnitaryStatement, scope);
                break;
            case 'VariableDeclarationStatement':
                walkVariableDeclarationStatement(statement as VariableDeclarationStatement, scope);
                break;
            case 'WhileStatement':
                walkWhile(statement as WhileStatement, scope);
                break;                                                                           
        }
    });
    (<any>block).scope = scope;
    return scope;
}

function prewalk(block: Block, parent?: JavascriptScope) {
    let scope =  new JavascriptScope();
    scope.parent = parent;
    block.body.forEach((statement: Statement) => {
       switch(statement.type) {
           case 'VariableDeclarationStatement':
                prewalkDeclaration(statement as VariableDeclarationStatement, scope);
                break;
           case 'FunDeclarationStatement':
                prewalkFunDeclaration(statement as FunDeclarationStatement, scope);
                break;
           case 'ClassDeclarationStatement':
                prewalkClassDeclaration(statement as ClassDeclarationStatement, scope);
                break;   
           case 'ImportStatement':
                preWalkImport(statement as ImportStatement, scope);
                break;            
       }
    });
    (<any>block).scope = scope;
    return scope;
}

function preWalkImport(statement: ImportStatement, scope: JavascriptScope) {
    let identifiers = [statement.identifier].concat(statement.identifiers || []);
    identifiers.forEach(ident => {
        if (ident.as) {
            scope.imports.add(ident.as.identifier)
        } else if (ident.name) {
            scope.imports.add(ident.name.identifier)
        }
    })
}

function prewalkDeclaration(statement: VariableDeclarationStatement, scope: JavascriptScope) {
    let declarations, unique = false;
    switch(statement.declarationKeyWord) {
        case 'var':
            declarations = scope.varDeclarations;
            break;
        case 'let':
            declarations = scope.letDeclarations;
            unique = true;
            break;
        case 'const':
            declarations = scope.constDeclarations;
            unique = true;
            break;        
    } 
    statement.declarations.forEach((declaration: Statement) => {
        let identifier: string;
        if (declaration.type === 'IdentifierLiteratureStatement') {
            identifier = (<IdentifierLiteratureStatement>declaration).identifier;
        } else if (declaration.type === 'AssignStatement') {
            identifier = (<AssignStatement>declaration).left.identifier
        }
        if (scope.constDeclarations.has(identifier) || scope.letDeclarations.has(identifier) || unique && scope.varDeclarations.has(identifier)) {
            scope.exceptions.set(declarations, `Identifier '${identifier}' has already been declared`);
        } else {
            declarations.add(identifier);
        }
    })
}

function prewalkFunDeclaration(statement: FunDeclarationStatement, scope: JavascriptScope) {
    let identifier = statement.identifier && statement.identifier.identifier || null;
    if (!identifier) return;
    if (scope.constDeclarations.has(identifier) || scope.letDeclarations.has(identifier)) {
        scope.exceptions.set(statement, `Identifier '${identifier}' has already been declared`);
    } else {
        scope.varDeclarations.add(identifier);
    }
}

function prewalkClassDeclaration(statement: ClassDeclarationStatement, scope: JavascriptScope) {
    let identifier = statement.className && statement.className.identifier || null;
    if (!identifier) return;
    if (scope.constDeclarations.has(identifier) || scope.letDeclarations.has(identifier)) {
        scope.exceptions.set(statement, `Identifier '${identifier}' has already been declared`);
    } else {
        scope.varDeclarations.add(identifier);
    }
}

function walkVariableDeclarationStatement(statement: VariableDeclarationStatement, scope: JavascriptScope) {
    statement.declarations.forEach((declaration: Statement) => {
        if (declaration.type === 'AssignStatement') {
            scope.setDesc((<AssignStatement>declaration).left.identifier, getDesc((<AssignStatement>declaration).right, scope));
        }
    })
}

function walkAssignStatement(statement: AssignStatement, scope: JavascriptScope) {
    tryWalk(statement.left, scope);
    tryWalk(statement.right, scope);

    if (statement.left.type === 'AccessProStatement') {
        let names = gatherNames(statement);
        scope.setDesc(names, getDesc(statement.right, scope));
    } else if (statement.left.type === 'IdentifierLiteratureStatement') {
        scope.setDesc((<IdentifierLiteratureStatement>statement.left).identifier, getDesc(statement.right, scope))
    }
}

function getDesc(statement: Statement, scope: JavascriptScope) {
    switch(statement.type) {
       case 'AccessProStatement':
           let names = gatherNames(statement);
           return scope.getDesc(names);
       case 'IdentifierLiteratureStatement':
           return scope.getDesc((<IdentifierLiteratureStatement>statement).identifier)   
       case 'ArrayLiteratureStatement':
       case 'ObjectLiteratureStatement':    
           return new ValueDesc('', statement);
       case 'AssignStatement':
           return getDesc((<AssignStatement>statement).right, scope);
       case 'FunDeclarationStatement':
           return (<any>statement)._valueDesc;
       case 'BracketEnwrapStatement':
           return getDesc((<BracketEnwrapStatement>statement).statement, scope);
       case 'NewStatement':
           let desc, identifier;
           if ((<NewStatement>statement).constructorCallee.type === 'FunctionCallStatement') {
               identifier = (<NewStatement>statement).constructorCallee.identifier;
           } else {
               identifier = (<NewStatement>statement).constructorCallee;
           }             
           desc = getDesc(identifier, scope);
           if (desc && desc.isFunction || desc.isClass) {
               return desc.createClassInstanceDesc()
           }
       default:
           return null;     
    }
}

function gatherNames(statement: AccessProStatement) {
    let names = [], owner = statement.owner;
    if (owner.type === 'AccessProStatement') {
        names = gatherNames(owner).concat(names);
    } else if (owner.type === 'IdentifierLiteratureStatement') {
        names.push((<IdentifierLiteratureStatement>owner).identifier, statement.propertyName.identifier)
    } else {
        return null;
    }
    if (names.includes(null)) return null;
    return names;
}

function walkArray(statement: ArrayLiteratureStatement, scope: JavascriptScope) {
    statement.items.forEach((item: Statement) => {
       tryWalk(item as Statement, scope);
    })
}

function walkBracketEnwrap(statement: BracketEnwrapStatement, scope: JavascriptScope) {
    tryWalk(statement.statement, scope);
}

function walkObj(statement: ObjectLiteratureStatement, scope: JavascriptScope) {
    statement.properties.forEach(prop => {
        tryWalk(prop.value, scope);
    })
}

function walkCondition(statement: ConditionStatement, scope: JavascriptScope) {
    tryWalk(statement.if.condition as Statement, scope);
    statement.elseIf.forEach(item => {
        tryWalk(item.condition as Statement, scope);
    })
}

function walkFunCall(statement: FunctionCallStatement, scope: JavascriptScope) {
    if (assertNotDeclared((<FunctionCallStatement>statement).identifier, scope)) return;
    statement.arguments.forEach((arg: Statement) => {
        tryWalk(arg, scope);
    })
}

function walkNew(statement: NewStatement, scope: JavascriptScope) {
    tryWalk(statement.constructorCallee, scope);
}

function walkDoWhile(statement: DoWhileStatement, scope: JavascriptScope) {
    tryWalk(statement.whileCondition, scope);
}

function walkWhile(statement: WhileStatement, scope: JavascriptScope) {
    tryWalk(statement.whileCondition, scope);
}


function walkForLoop(statement: ForLoopStatement, scope) {
    let childScope: JavascriptScope = new JavascriptScope(null ,scope);
    if (statement.item.type === 'VariableDeclarationStatement') {
        prewalkDeclaration(statement.item as VariableDeclarationStatement, childScope)
    } 

    tryWalk(statement.item, scope);

    if (statement.part1.type === 'VariableDeclarationStatement') {
        prewalkDeclaration(statement.part1 as VariableDeclarationStatement, childScope)
    }

    tryWalk(statement.part1, scope);

    tryWalk(statement.forIn, scope);
    tryWalk(statement.forOf, scope);    
    tryWalk(statement.part2, scope);
    tryWalk(statement.part3, scope);

    walk(statement.body, childScope);
}

function walkFunDeclaration(statement: FunDeclarationStatement, scope: JavascriptScope) {
    let childScope = new JavascriptScope(null, scope);
    let desc: ValueDesc, thisDesc;
    statement.formalParas.forEach(para => childScope.varDeclarations.add(para.identifier));
    walk(statement.body, childScope);
    desc = new ValueDesc('', statement);
    thisDesc = (<any>statement.body).scope.thisDesc;
    desc.instanceProp = new Set(Array.from(thisDesc.props));
    desc.instancePropDescs = Object.assign({}, thisDesc.propDesc);
    if (statement.identifier) scope.setDesc(statement.identifier.identifier, desc);
}

function walkClassDeclaration(statement: ClassDeclarationStatement, scope: JavascriptScope) {
    if(scope.exceptions.has(statement)) return;
    let classScope = new ClassScope(scope);

    statement.methods.forEach((item: FunDeclarationStatement) => {
       if(item.identifier.identifier !== 'constructor') {
         prewalkFunDeclaration(item, classScope);
       } 
    });

    statement.methods.forEach((item: FunDeclarationStatement) => {
        walkFunDeclaration(item, classScope);
        if (item.identifier.identifier === 'constructor') {
            classScope.thisDesc = (<any>item.body).scope.thisDesc;
        }
    })

    let desc = classScope.createClassDesc(statement);

    if (statement.extend) {
        let extendDesc: ValueDesc = getDesc(statement.extend, scope);
        if (extendDesc && (extendDesc.isFunction || extendDesc.isClass)) {
            desc.prototype.prototype = extendDesc.createClassInstanceDesc();
        }
    }
    return desc;
}

function walkComputeAccess(statement: ComputeAccessStatement, scope: JavascriptScope) {
    tryWalk(statement.owner, scope);
    tryWalk(statement.propertyName, scope);
}

function walkSwitch(statement: SwitchStatement, scope: JavascriptScope) {
    tryWalk(statement.beCompared, scope);
    statement.case.forEach((item: CaseStatement) => {
        tryWalk(item.condition, scope);
        walk(item.body, scope);
    })
}

function walkTemplateString(statement: TemplateStringStatement, scope: JavascriptScope) {
    statement.content.forEach(item => item instanceof Statement && tryWalk(item, scope))
}

function walkTernary(statement: TernaryStatement, scope: JavascriptScope) {
    tryWalk(statement.condition, scope);
    tryWalk(statement.trueStatement, scope);
    tryWalk(statement.falseStatement, scope);
}

function walkTryCatch(statement: TryCathchStatement, scope: JavascriptScope) {
    walk(statement.tryBody, scope);
    walk(statement.finnalBody, scope);
    walkFunDeclaration(statement.catchCallback, scope);
}

function walkUnitary(statement: UnitaryStatement, scope: JavascriptScope) {
    tryWalk(statement.target, scope);
}

function walkComputeStatement(statement: ComputeStatement, scope: JavascriptScope) {
    if (statement.left.type === 'ComputeStatement') {
        walkComputeStatement(statement.left, scope);
    } else {
        tryWalk(statement.left, scope);
    }

    if (statement.right.type === 'ComputeStatement') {
        walkComputeStatement(statement.right, scope)
    } else {
        tryWalk(statement.right, scope);
    }
}

function tryWalk(statement: Statement, scope: JavascriptScope) {
    if (!statement) return;
    switch(statement.type) {
        case 'AssignStatement':
            walkAssignStatement(statement as AssignStatement, scope);
            break;
        case 'ArrayLiteratureStatement':
            walkArray(statement as ArrayLiteratureStatement, scope);
            break;
        case 'ObjectLiteratureStatement':
            walkObj(statement as ObjectLiteratureStatement, scope) 
            break;
        case 'FunctionCallStatement':
            walkFunCall(statement as FunctionCallStatement, scope) 
            break;
        case 'BracketEnwrapStatement':
            walkBracketEnwrap(statement as BracketEnwrapStatement, scope)
            break;        
        case 'IdentifierLiteratureStatement':
            assertNotDeclared(statement, scope);
            break;  
        case 'ComputeStatement':
            walkComputeStatement(statement as ComputeStatement, scope);
            break
        case 'FunDeclarationStatement':
            walkFunDeclaration(statement as FunDeclarationStatement, scope);
            break;
        case 'TemplateStringStatement':
            walkTemplateString(statement as TemplateStringStatement, scope);
            break;
        case 'TernaryStatement':
            walkTernary(statement as TernaryStatement, scope);     
            break;
        case 'BracketEnwrapStatement':
            walkBracketEnwrap(statement as BracketEnwrapStatement, scope);
            break;
        case 'NewStatement':
            walkNew(statement as NewStatement, scope);
            break;  
        case 'ComputeAccessStatement':
            walkComputeAccess(statement as ComputeAccessStatement, scope);                 

    }
}

function assertNotDeclared(statement: Statement, scope: JavascriptScope) {
    if (statement.type === 'IdentifierLiteratureStatement' && scope.has((<IdentifierLiteratureStatement>statement).identifier)) {
        scope.exceptions.set(statement, `Identifier ${(<IdentifierLiteratureStatement>statement).identifier} is not declared`);
        return true;
    }

    return false;
}

