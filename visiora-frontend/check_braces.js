const fs = require('fs');
const content = fs.readFileSync('app/wallet/page.tsx', 'utf8');

let stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
            if (stack.length === 0) {
                console.log(`Error: Unexpected '${char}' at line ${i + 1}:${j + 1}`);
            } else {
                const last = stack.pop();
                if (
                    (char === '}' && last.char !== '{') ||
                    (char === ')' && last.char !== '(') ||
                    (char === ']' && last.char !== '[')
                ) {
                    console.log(`Error: Mismatched '${char}' at line ${i + 1}:${j + 1}. Expected closing version of '${last.char}' from line ${last.line}:${last.col}`);
                }
            }
        }
    }
}

if (stack.length > 0) {
    stack.forEach(s => {
        console.log(`Error: Unclosed '${s.char}' at line ${s.line}:${s.col}`);
    });
} else {
    console.log('Braces are balanced.');
}
