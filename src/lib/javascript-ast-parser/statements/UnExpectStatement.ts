import { Statement } from "./Statement";

export class UnExpectStatement extends Statement {
    type = 'UnExpectStatement';
    constructor(public value?: any, public msg?: string, loc?: any) {
        super();
        if (loc) {
            Object.assign(this.loc, loc);
        } else if (value && value instanceof Statement) {
            this.loc.start = value.loc.start;
            this.loc.end = value.loc.end;
        }
    }
}