const { log, chalk } = require('./log');

function executeAction(action) {
  if (action instanceof Array) {
    for (singleAction of action) {
      const result = executeAction(singleAction);
      if (result !== true) { return result; }
    }
    return true;
  } else {
    return action();
  }
}

module.exports = function runSteps(steps, args) {
  return steps.every(({ title, action, skipOn }, index) => {
    log(chalk`{gray Step ${index + 1}: }{white ${title}...}`);
    const skipStep = skipOn && args.includes(skipOn);
    const result = skipStep ? 'SKIPPED' : executeAction(action);
    if (result === true) {
      log(chalk`{greenBright SUCCESS}\n`);
      return true;
    } else if (result === 'SKIPPED') {
      log(chalk`{yellowBright SKIPPED}\n`);
      return true;
    } else {
      log(chalk`{redBright FAILED}\n`);
      if (typeof (result) === 'string') {
        log(chalk`\n{white ${result}}\n\n`);
      }
      return false;
    }
  });
}