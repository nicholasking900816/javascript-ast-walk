import { Statement } from "./Statement";

export class ValueLiteratureStatement extends Statement {
    type = 'ValueLiteratureStatement';
    value: string;
    constructor(currentToken) {
        super();
        Object.assign(this.loc, currentToken.loc);
        this.value = currentToken.value;    
    }
}