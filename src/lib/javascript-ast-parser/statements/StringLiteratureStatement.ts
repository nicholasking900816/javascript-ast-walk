import { ComputeStatement } from "./ComputeStatement";
import { Statement } from "./Statement";

export class StringLiteratureStatement extends Statement {
    type = 'StringLiteratureStatement';
    value: string;
    constructor(currentToken: any) {
        super();
        Object.assign(this.loc, currentToken.loc);
        this.value = currentToken.value;
    }
}