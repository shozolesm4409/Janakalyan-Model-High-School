const fs = require('fs');

let content = fs.readFileSync('src/AdminDashboard.tsx', 'utf8');

const regex = /\s*\{\/\* Add Field Section \(REQUEST 2 option file included below\) \*\/\}[\s\S]*?(?=\n\s*\}\n\s*\)\(\)\n\s*\}\)\n\s*<\/div>)/;

const match = content.match(regex);
if (!match) {
  console.log('Match not found');
  process.exit(1);
}

const block = match[0];
content = content.replace(block, '');

const insertRegex = /(\s*\{\/\* Drag & Drop Sorted Fields List \*\/\})/;
content = content.replace(insertRegex, block + '\n$1');

fs.writeFileSync('src/AdminDashboard.tsx', content);
console.log('File updated');
