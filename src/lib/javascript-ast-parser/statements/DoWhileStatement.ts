import { Block } from "../Block";
import { Statement } from "./Statement";

export class DoWhileStatement extends Statement {
    type = "DoWhileStatement";
    doBody: Block;
    whileCondition: Statement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}