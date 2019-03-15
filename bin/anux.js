#!/usr/bin/env node
'use strict';

const root = process.cwd();

// loop through the args
process.argv.some((arg, index) => {
  const args = process.argv.slice(index);
  if (arg === 'publish') { require('./publish.js')({ root, args }); return true; }
});