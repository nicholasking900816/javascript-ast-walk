import { ComputeStatement } from "./ComputeStatement";
import { OperatorStatement } from "./OperatorStatement";

export class Statement {
    unexpects: any;
    type: string;
    prefix: OperatorStatement;
    suffix: OperatorStatement;
    loc: {start: number, end: number};
    constructor() {
        this.unexpects = [];
        this.loc = {start: null, end: null};
    }
}