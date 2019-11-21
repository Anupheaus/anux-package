#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { end, resolveFile } = require('./utils');
const { logError } = require('./log');

(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) { args.push('install'); }

  const command = args[0].toLowerCase();
  const remainingArgs = args.slice(1);

  const commandFile = await resolveFile(`bin/anux-${command}.js`);

  if (!commandFile) { throw new Error(`Unexpected command: ${command}`); }
  const commandFunc = require(commandFile);

  await commandFunc(remainingArgs);

  end();
})().catch(error => {
  logError(error.message);
  // eslint-disable-next-line no-console
  console.error(error);
  end();
});