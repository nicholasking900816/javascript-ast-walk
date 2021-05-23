import { Statement } from "./Statement";

export class TemplateStringStatement extends Statement {
    type: string = 'TemplateStringStatement';
    content: any[] = [];
    constructor() {
        super()
    }
}