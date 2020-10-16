module.exports = {
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2019,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'plugins': [
    '@typescript-eslint',
    'import',
    'chai-friendly',
    'mocha',
    'react',
  ],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:mocha/recommended',
    'plugin:react/recommended',
  ],
  'settings': {
    'react': {
      'version': 'detect',
    },
  },
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'commonjs': true
  },
  'rules': {
    'quotes': [
      'error',
      'single',
      {
        'avoidEscape': true
      }
    ],
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
    'max-len': [
      'warn',
      {
        'code': 180
      }
    ],
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'sort-imports': 'off',
    'no-unused-vars': 'off',
    'no-shadow': 'off',
    'no-unused-expressions': 'off',
    'no-unused-labels': 'error',
    'prefer-const': [
      'error',
      {
        'destructuring': 'all'
      }
    ],
    'max-classes-per-file': 'error',
    'no-inner-declarations': 'off',
    'no-console': 'warn',
    'no-alert': 'warn',
    '@typescript-eslint/member-ordering': [
      'warn',
      {
        'default': [
          'constructor',
          'private-static-field',
          'protected-static-field',
          'public-static-field',
          'public-static-method',
          'protected-static-method',
          'private-static-method',
          'private-instance-field',
          'protected-instance-field',
          'public-instance-field',
          'public-instance-method',
          'protected-instance-method',
          'private-instance-method'
        ]
      }
    ],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-shadow': ['warn'],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/indent': [
      'error',
      2
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/unified-signatures': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'args': 'after-used',
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
      },
    ],
    'import/no-unresolved': 'error',
    'import/export': 'off',
    'import/order': 'off',
    'import/named': 'off',
    'chai-friendly/no-unused-expressions': 'off',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-mocha-arrows': 'off',
    'mocha/handle-done-callback': 'off',
    'mocha/no-setup-in-describe': 'off',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
  },
};
