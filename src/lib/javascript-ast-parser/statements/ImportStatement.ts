import { Statement } from "./Statement";
import { StringLiteratureStatement } from "./StringLiteratureStatement";

export class ImportStatement extends Statement {
    type = 'ImportStatement';
    identifiers: any[] = null;
    identifier: any = {
        name: null,
        as: null
    };
    from: any = null;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}