import { Statement } from "./Statement";
import { StringLiteratureStatement } from "./StringLiteratureStatement";

export class ExportStatement extends Statement {
    type = 'ExportStatement';
    exportContent: any = [];
    from: StringLiteratureStatement;
    constructor(currentToken: any) {
        super()
        this.loc.start = currentToken.loc.start;
    }
}