const modulePath = require.resolve('stylelint-config-sass-guidelines');
module.exports = {
  "extends": modulePath,
  "ignoreFiles": "./**/*.tsx",
  "rules": {
    "selector-type-no-unknown": null,
    "selector-no-qualifying-type": null,
    "no-descending-specificity": null,
    "max-nesting-depth": null,
    "color-named": null,
    "selector-max-compound-selectors": null,
    "scss/at-import-partial-extension-blacklist": null
  }
}