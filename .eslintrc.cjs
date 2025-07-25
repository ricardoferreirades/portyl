module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'error',
    
    // JavaScript/General rules
    'no-console': 'warn',
    'no-unused-vars': 'off', // Use TypeScript version instead
    'eqeqeq': 'error',
    'curly': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Code quality
    'no-debugger': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'warn',
    'no-unreachable': 'error',
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  ignorePatterns: [
    // Build outputs
    'dist/',
    'coverage/',
    '*.min.js',
    '*.bundle.js',
    
    // Dependencies
    'node_modules/',
    
    // Config files (they may have different linting needs)
    '*.config.js',
    '*.config.ts',
    'rollup.config.js',
    'jest.config.js',
    'vite.config.ts',
    
    // Generated files
    '*.d.ts',
  ],
  overrides: [
    // More relaxed rules for test files
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-console': 'off',
      },
    },
    // More relaxed rules for example files
    {
      files: ['example/**/*', 'examples/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};
