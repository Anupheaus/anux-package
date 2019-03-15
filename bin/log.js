const chalk = require('chalk');

module.exports = {
  log(text) {
    process.stdout.write(text);
  },
  chalk,
};
