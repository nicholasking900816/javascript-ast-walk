import { ComputeStatement } from "./ComputeStatement";
import { Statement } from "./Statement";

export class FunctionCallStatement extends Statement {
    type = 'FunctionCallStatement';
    arguments: Statement[] = [];
    constructor(public identifier: Statement) {
        super();
        this.loc.start = identifier.loc.start;
    }
}