import { FunctionCallStatement } from "./FunctionCallStatement";
import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";

export class NewStatement extends Statement {
    type = 'NewStatement';
    constructorCallee: FunctionCallStatement | IdentifierLiteratureStatement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start
    }
}