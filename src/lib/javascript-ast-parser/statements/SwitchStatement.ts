import { Block } from "../Block";
import { CaseStatement } from "./CaseStatement";
import { Statement } from "./Statement";

export class SwitchStatement extends Statement {
    type = 'SwitchStatement';
    case: CaseStatement[] = [];
    beCompared: Statement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
    }
}