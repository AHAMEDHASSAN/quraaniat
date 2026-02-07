const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\Win 10 Pro\\.gemini\\antigravity\\brain\\98b1c206-67fe-455c-b741-9fc1638d67f1\\quranin_app_icon_v2_text_1768466593049.png";
const dest = path.join(__dirname, 'img', 'icon-512.png');

console.log('Starting copy operation...');
console.log('Source:', source);
console.log('Destination:', dest);

try {
    if (!fs.existsSync(source)) {
        console.error('Source file does not exist!');
        process.exit(1);
    }
    
    const data = fs.readFileSync(source);
    console.log('Read ' + data.length + ' bytes from source.');
    
    fs.writeFileSync(dest, data);
    console.log('Successfully wrote data to destination.');
    
    const stats = fs.statSync(dest);
    console.log('Destination file size:', stats.size);
    
} catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
}
console.log('DONE');
