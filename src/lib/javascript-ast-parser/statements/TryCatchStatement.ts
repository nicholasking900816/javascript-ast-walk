import { Block } from "../Block";
import { FunDeclarationStatement } from "./FunDeclarationStatement";
import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";

export class TryCathchStatement extends Statement {
    type = 'TryCathchStatement';
    tryBody: Block;
    catchCallback: FunDeclarationStatement;
    finnalBody: Block;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}