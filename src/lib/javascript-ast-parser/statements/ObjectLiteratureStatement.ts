import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";
import { StringLiteratureStatement } from "./StringLiteratureStatement";

export class ObjectLiteratureStatement extends Statement {
    type = 'ObjectLiteratureStatement';
    properties: Array<{key: StringLiteratureStatement | IdentifierLiteratureStatement, value: Statement}> = [];
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}