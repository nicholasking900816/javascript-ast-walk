import { priorityMap } from "../constants";
import { OperatorStatement } from "./OperatorStatement";
import { Statement } from "./Statement";

export class ComputeStatement extends Statement {
    type = 'ComputeStatement';
    constructor(public operator?: OperatorStatement, public left?: Statement, public right?: Statement) {
        super();
        if (left) this.loc.start = left.loc.start;
    }


}