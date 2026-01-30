const fs = require('fs');
const content = fs.readFileSync('app/wallet/page.tsx', 'utf8');
const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
console.log('Divs:', openDivs, 'open,', closeDivs, 'close');

const openPT = (content.match(/<PageTransition/g) || []).length;
const closePT = (content.match(/<\/PageTransition>/g) || []).length;
console.log('PageTransition:', openPT, 'open,', closePT, 'close');
