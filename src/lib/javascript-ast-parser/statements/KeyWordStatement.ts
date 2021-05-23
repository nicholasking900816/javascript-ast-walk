import { Statement } from "./Statement";

export class KeyWordStatement extends Statement {
    type = "KeyWordStatement";
    keyWord: string;
    constructor(currentToken: any) {
        super();
        this.loc.start = currentToken.loc.start;
        this.loc.end = currentToken.loc.end;
        this.keyWord = currentToken.value;
    }
}