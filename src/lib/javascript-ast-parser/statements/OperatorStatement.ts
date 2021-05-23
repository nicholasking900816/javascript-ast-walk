import { priorityMap } from "../constants";
import { Statement } from "./Statement";

export class OperatorStatement extends Statement {
    operator: string;
    priority: number;
    isAssignOperator = false;
    constructor(currentToken: any) {
        super();
        this.operator = currentToken.value;
        this.priority = priorityMap[this.operator];
        this.isAssignOperator = currentToken.isAssignOperator;
        Object.assign(this.loc, currentToken.loc);
    }
}