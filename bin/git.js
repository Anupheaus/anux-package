const shell = require('./shell');
const shelljs = require('shelljs');

module.exports = {
  hasUncommittedChanges() {
    const output = shelljs.exec('git status -s', { silent: true });
    return typeof (output) === 'object' && typeof (output.stdout) === 'string' && output.stdout.length > 0;
  },
  getBranchName() {
    const output = shelljs.exec('git branch | grep \* | cut -d \' \' -f2', { silent: true });
    return typeof (output) === 'object' && typeof (output.stdout) === 'string' && output.stdout;
  },
  isBranch(name) {
    const actualName = this.getBranchName();
    return actualName === name;
  },
  push() {
    return shell.exec('git push');
  },
  commit(message) {
    return shell.exec(`git commit -m '${message}'`);
  },
  mergeInto(name, tag) {
    const currentBranchName = this.getBranchName();
    const cmds = [
      `git checkout ${name}`,
      `git pull`,
      `git merge ${currentBranchName} -m 'Merge branch ${currentBranchName}'`,
      tag ? `git tag ${tag}` : undefined,
      `git push`,
      `git push --tags`,
      `git checkout ${currentBranchName}`,
    ].filter(v => v != null);
    return shell.exec(cmds);
  },
  getRemoteName() {
    const output = shelljs.exec('git remote', { silent: true });
    const remoteNames = output.stdout.split('\n').filter(v => v.length !== 0);
    if (remoteNames.length > 1) { throw new Error('There are too many remotes to know which one to use.'); }
    if (remoteNames.length === 0) { throw new Error('There are no remotes available in this repository.'); }
    return remoteNames[0];
  }
};
