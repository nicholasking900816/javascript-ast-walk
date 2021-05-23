import { ClassDeclarationStatement } from "../lib/javascript-ast-parser/statements/ClassDeclarationStatement";
import { JavascriptScope } from "./JavascriptScope";
import { ValueDesc } from "./VariableDesc";

export class ClassScope extends JavascriptScope {
    constructor(public parent?: JavascriptScope) {
        super(null, parent);
    }

    getDesc(name: string | string[]) {
        let names = typeof name === 'string' ? [name] : name;
        if (names[0] === 'this') return super.getDesc(name);
        return this.parent.getDesc(name);
    }

    createClassDesc(statement: ClassDeclarationStatement) {
        let desc = new ValueDesc(null, statement);
        let protoDesc = new ValueDesc(null);
        protoDesc.props = new Set(Array.from(this.funDeclarations));
        protoDesc.propDesc = Object.assign({}, this.vDescs);
        desc.instanceProp = new Set(Array.from(this.thisDesc.props));
        desc.instancePropDescs = Object.assign({}, this.thisDesc.propDesc);  
        desc.prototype = protoDesc;
        return desc;
    }
}