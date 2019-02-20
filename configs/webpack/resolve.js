module.exports = function resolve(options) {
  return {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      ...options.aliases,
    },
  };
};
