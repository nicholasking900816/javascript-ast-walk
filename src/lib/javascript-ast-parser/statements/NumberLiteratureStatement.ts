import { ComputeStatement } from "./ComputeStatement";
import { Statement } from "./Statement";

export class NumberLiteratureStatement extends Statement {
    type = "NumberLiteratureStatement";
    value: string;
    constructor(currentToken?: any) {
        super()
        Object.assign(this.loc, currentToken.loc);
        this.value = currentToken.value;
    }
}