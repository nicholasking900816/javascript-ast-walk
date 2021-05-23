import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement"

export class VariableDeclarationStatement extends Statement {
    type = 'VariableDeclarationStatement';
    declarationKeyWord: string;
    declarations: Statement[] = [];
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
        this.declarationKeyWord = currentToken.value;
    }
}