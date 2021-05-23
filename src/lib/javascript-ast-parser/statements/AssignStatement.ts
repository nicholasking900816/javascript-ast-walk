import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { OperatorStatement } from "./OperatorStatement";
import { Statement } from "./Statement";

export class AssignStatement extends Statement {
    type = 'AssignStatement';
    left: IdentifierLiteratureStatement;
    right: Statement;
    operator: OperatorStatement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start

    }
}