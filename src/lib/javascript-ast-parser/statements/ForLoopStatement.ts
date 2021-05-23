import { Block } from "../Block";
import { ArrayLiteratureStatement } from "./ArrayLiteratureStatement";
import { IdentifierLiteratureStatement } from "./IdentifierLiteratureStatement";
import { Statement } from "./Statement";
import { VariableDeclarationStatement } from "./VariableDeclarationStatement";

export class ForLoopStatement extends Statement {
    type = 'ForLoopStatement';
    forOf: Statement;
    forIn: Statement;
    item: Statement;
    part1: Statement;
    part2: Statement;
    part3: Statement;
    body: Block;
    constructor(currentToken: any) {
        super()
        this.loc.start = currentToken.loc.start;
    }
}