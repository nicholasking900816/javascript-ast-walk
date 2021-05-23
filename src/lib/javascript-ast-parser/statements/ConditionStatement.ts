import { Block } from "../Block";
import { Statement } from "./Statement";

export class ConditionStatement extends Statement {
    type = 'ConditionStatement'
    if = { condition: null, body: null }
    elseIf: any = [];
    else: Block;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}