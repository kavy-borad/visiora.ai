const fs = require('fs');
const content = fs.readFileSync('app/wallet/page.tsx', 'utf8');
const openMain = (content.match(/<main/g) || []).length;
const closeMain = (content.match(/<\/main>/g) || []).length;
console.log('Main:', openMain, 'open,', closeMain, 'close');
