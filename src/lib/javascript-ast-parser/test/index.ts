import { JavascriptAstParsser } from "../JavascriptAstParser";

debugger;
let ast = new JavascriptAstParsser(`
  export const aa = 'aa'
`).parse();

console.log(ast);

function aa () {

}

if(true) console.log('a') 
else console.log('dd')

let a = 'a'

switch(a) {
    default:
        console.log('dd')
    case 'bb':
        console.log('cc')
}