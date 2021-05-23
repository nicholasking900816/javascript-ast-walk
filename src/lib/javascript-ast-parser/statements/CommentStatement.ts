import { Statement } from "./Statement";

export class CommontStatement extends Statement {
    type = 'CommonStatement';
    content: string;

    constructor(currentToken) {
        super();
        this.loc.start = currentToken.loc.start
    }
}