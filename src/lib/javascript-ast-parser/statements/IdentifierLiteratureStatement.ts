import { ComputeStatement } from "./ComputeStatement";
import { Statement } from "./Statement";

export class IdentifierLiteratureStatement extends Statement {
    type = 'IdentifierLiteratureStatement';
    identifier: string;
    constructor(public currentToken: any) {
        super()
        Object.assign(this.loc, currentToken.loc);
        this.identifier = currentToken.value;
    }
}