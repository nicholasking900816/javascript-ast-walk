import { Statement } from "./Statement";

export class TernaryStatement extends Statement {
    type = 'TernaryStatement';
    constructor(public condition?: Statement, public trueStatement?: Statement, public falseStatement?: Statement) {
        super();
        this.loc.start = condition.loc.start;
    }
}