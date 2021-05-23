import { Statement } from "./Statement";

export class ArrayLiteratureStatement extends Statement {
    type = 'ArrayLiteratureStatement';
    items: Statement[] = [];
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}