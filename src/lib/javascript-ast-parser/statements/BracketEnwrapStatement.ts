import { Statement } from "./Statement";

export class BracketEnwrapStatement extends Statement {
    type = 'BracketEnwrapStatement';
    statement: Statement;
    constructor(currentToken) {
        super();
        this.loc.start = currentToken.loc.start
    }
}