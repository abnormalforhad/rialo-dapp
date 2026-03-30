const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
};

const replaceInFile = (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds: Hardcoded darks -> glassy whites
  content = content.replace(/bg-\[\#06060e\]/g, 'bg-[#FAF9F7]'); // layout body
  content = content.replace(/bg-\[\#0[a-f0-9]{5}\](\/[0-9]+)?/g, 'glass'); // other dark bgs
  content = content.replace(/bg-\[\#141420\]/g, 'bg-white shadow-xl');
  content = content.replace(/bg-white\/(5|10|\[0\.[0-9]+\])/g, 'bg-white/60');
  
  // Borders
  content = content.replace(/border-white\/(\[0\.[0-9]+\]|10)/g, 'border-zinc-200/60 shadow-sm backdrop-blur-md');
  
  // Text
  content = content.replace(/text-white/g, 'text-zinc-900');
  content = content.replace(/text-zinc-(300|400|500)/g, 'text-zinc-600');
  content = content.replace(/placeholder:text-zinc-600/g, 'placeholder:text-zinc-400');
  
  // App layout specifics
  if (filePath.endsWith('layout.tsx')) {
    content = content.replace(/antialiased dark/g, 'antialiased');
  }

  // Hover states
  content = content.replace(/hover:bg-white\/[0-9]+/g, 'hover:bg-zinc-100/50');
  content = content.replace(/hover:text-white/g, 'hover:text-zinc-900');
  content = content.replace(/hover:border-white\/10/g, 'hover:border-zinc-300');

  // Fix up a few specific bad replacements
  content = content.replace(/text-zinc-600 shrink-0/g, 'text-zinc-400 shrink-0');
  content = content.replace(/from-transparent via-white\/10 to-transparent/g, 'from-transparent via-zinc-200 to-transparent');
  content = content.replace(/divide-white\/\[0\.04\]/g, 'divide-zinc-200');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified:', filePath);
  }
};

walk('./src', replaceInFile);
