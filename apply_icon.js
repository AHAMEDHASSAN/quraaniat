const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\Win 10 Pro\\.gemini\\antigravity\\brain\\98b1c206-67fe-455c-b741-9fc1638d67f1\\uploaded_image_1768467497089.png";
const dest = path.join('img', 'icon-512.png');

console.log('Copying icon...');
console.log('Source:', source);
console.log('Destination:', dest);

try {
    const data = fs.readFileSync(source);
    fs.writeFileSync(dest, data);
    console.log('Successfully copied icon!');
} catch (err) {
    console.error('Error during copy:', err);
    process.exit(1);
}
