import { Statement } from "./Statement";

export class UnitaryStatement extends Statement {
    type = 'UnitaryStatement';
    keyWord: string;
    target: Statement;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
        this.keyWord = currentToken.value;
    }
}