const shell = require('shelljs');

module.exports = {
  exec(command) {
    if (command instanceof Array) {
      for (let singleCommand of command) {
        const result = this.exec(singleCommand);
        if (result !== true) { return result; }
      }
      return true;
    } else {
      const output = shell.exec(command, { silent: true });
      if (output.code === 0) { return true; }
      return output.stderr;
    }
  },
};
