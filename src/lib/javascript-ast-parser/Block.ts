import { Statement } from "./statements/Statement";

export class Block {
  body: Statement[] = [];
  constructor(public type: string) {}
}