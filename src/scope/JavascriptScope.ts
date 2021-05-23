import { Statement } from "../lib/javascript-ast-parser/statements/Statement";
import { ValueDesc } from "./VariableDesc";

export class JavascriptScope {
    vDescs: any = {};
    exportVDescs: any = {};
    varDeclarations: Set<any> = new Set();
    letDeclarations: Set<any> = new Set();
    funDeclarations: Set<any> = new Set();
    constDeclarations: Set<string> = new Set();
    classDeclarations: Set<String> = new Set();
    exports: Set<string> = new Set();
    imports: Set<string> = new Set();
    children: JavascriptScope[] = [];
    exceptions: Map<any, any> = new Map();
    thisDesc: ValueDesc = new ValueDesc('');
    
    constructor(public path?:string, public parent?: JavascriptScope) {

    }

    has(varName: string) {
        return this.varDeclarations.has(varName) || 
               this.constDeclarations.has(varName) || this.letDeclarations.has(varName) || 
               this.imports.has ||
               this.parent && this.parent.has(varName);
    }

    getExports(varName: string) {

    }

    setDesc(name: string | string[], value: ValueDesc) {
        if (!name || !value) return;
        let names = typeof name === 'string' ? [name] : name;
        let ident = names.shift();
        if (names.length) {
            if (ident === 'this') return this.setThisProp(names, value);
            let desc: ValueDesc = this.getDesc(ident);
            if (!desc) return;
            let i = 0,len = names.length - 1
            while(i< len) {
                if (desc.isFunction && names[i] === 'prototype') {
                    desc = desc.prototype
                } else {
                    desc = desc.propDesc[names[i]];
                }
                if (!desc) return;
                i ++
            }

            desc.propDesc[names[i]] = value;
            desc.props.add(names[i])
        } else {
            this.vDescs[ident] = value;
        }
    }    

    getDesc(name: string | string[]) {
        if (!name) return;
        let names = typeof name === 'string' ? [name] : name;
        let ident = names.shift();
        let desc: ValueDesc;
        if (ident === 'this') {
            desc = this.thisDesc;
        } else {
            desc = this.vDescs[ident] || (this.parent ? this.parent.getDesc(ident) : null);
        }
        if (desc && names.length) {
            let i = 0,len = names.length
            while(i< len) {
                if (desc.isFunction && names[i] === 'prototype') {
                    desc = desc.prototype
                } else {
                    desc = desc.propDesc[names[i]];
                }
                if (!desc) break;
                i ++
            }
        }
        
        return desc;
    }

    setThisProp(name: string | string[], value: Statement | ValueDesc) {
        let names = typeof name === 'string' ? [name] : name;
        if (names.length) {
            let desc: ValueDesc = this.thisDesc;
            if (!desc) return;
            let i = 0,len = names.length - 1
            while(i< len) {
                desc = desc.propDesc[names[i]];
                if (!desc) return;
                i ++
            }
            desc.propDesc[names[i]] = value instanceof ValueDesc ? value : new ValueDesc(names[i], value as Statement);
            desc.props.add(names[i]);
            
            desc.props.add(names[i])
        } 
    }
}