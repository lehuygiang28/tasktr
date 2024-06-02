#!/usr/bin/env node

const fs = require('fs');

function copyFile(source, destination) {
    fs.copyFileSync(source, destination);
    console.log(`File copied from ${source} to ${destination}`);
}

// Get command-line arguments
const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
    console.log('Usage: node copy-file.js <source> <destination>');
    process.exit(1);
}

copyFile(source, destination);
