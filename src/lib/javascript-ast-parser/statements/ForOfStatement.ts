import { Statement } from "./Statement";

export class ForOfStatement extends Statement {
    type = 'ForOfStatement';
    forOf: Statement;
    item: Statement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.start;
    }
}