import { ComputeStatement } from "./ComputeStatement";
import { Statement } from "./Statement";

export class ComputeAccessStatement extends Statement {
    type = 'ComputeAccessStatement';
    constructor(public owner?: Statement, public propertyName?: Statement) {
        super()
        this.loc.start = owner.loc.start;
    }
}