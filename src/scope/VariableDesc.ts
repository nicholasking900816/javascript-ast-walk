import { FunDeclarationStatement } from "../lib/javascript-ast-parser/statements/FunDeclarationStatement";
import { IdentifierLiteratureStatement } from "../lib/javascript-ast-parser/statements/IdentifierLiteratureStatement";
import { ObjectLiteratureStatement } from "../lib/javascript-ast-parser/statements/ObjectLiteratureStatement";
import { Statement } from "../lib/javascript-ast-parser/statements/Statement";

export class ValueDesc {
    isFunction = false;
    isObject = false;
    isClass = false;
    props: Set<string> = new Set();
    prototype: ValueDesc;
    instanceProp: Set<string> = new Set();
    instancePropDescs: any = {};
    propDesc: any = {};
    formalParams: Array<string> = [];
    constructor(public name: string, public statement?: Statement) {
        this._init();
        (<any>statement)._valueDesc = this;
    }
    
    private _init() {
        if (!this.statement) return;
        switch(this.statement.type) {
            case 'FunDeclarationStatement':
                this.isFunction = true;
                this.formalParams = (<FunDeclarationStatement>this.statement).formalParas.map((item: IdentifierLiteratureStatement) => item.identifier);
                break;
            case 'ObjectLiteratureStatement':
                (<ObjectLiteratureStatement>this.statement).properties.forEach((item: any) => {
                    if (item.value.type === 'ObjectLiteratureStatement' || item.value.type === 'FunDeclarationStatement') {
                        this.propDesc[item.key] = new ValueDesc(item.key, item.value);
                    }
                    this.props.add(item.key);
                });
                break
            case 'ArrayLiteratureStatement':
                this.isObject = true;
                break;    
        }
    }

    createClassInstanceDesc() {
        let desc = new ValueDesc('');
        desc.props = new Set(Array.from(this.instanceProp));
        desc.prototype = this.prototype;
        desc.isObject = true;
        desc.propDesc = Object.assign({}, this.instancePropDescs);
        return desc;
    }
}