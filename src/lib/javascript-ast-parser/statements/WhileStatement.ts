import { Block } from "../Block";
import { Statement } from "./Statement";

export class WhileStatement extends Statement {
    type = 'WhileStatement';
    whileCondition: Statement;
    whileBody: Block;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start
    }
}