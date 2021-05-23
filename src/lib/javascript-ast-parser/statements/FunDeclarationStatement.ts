import { Block } from "../Block";
import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";

export class FunDeclarationStatement extends Statement {
    type = 'FunDeclarationStatement';
    identifier: IdentifierLiteratureStatement;
    formalParas: IdentifierLiteratureStatement[] = [];
    body: Block;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start
    }
}