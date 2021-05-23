import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";

export class AccessProStatement extends Statement {
    type = 'AccessProStatement';
    constructor(public owner?: Statement, public propertyName?: IdentifierLiteratureStatement) {
        super()
        this.loc.start = owner.loc.start;
    }
}