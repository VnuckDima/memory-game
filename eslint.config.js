import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        URL: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        HTMLElement: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',

      // Запреты из задания: разметка создаётся только через document.createElement.
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Присваивание innerHTML запрещено заданием.' },
        { property: 'outerHTML', message: 'Присваивание outerHTML запрещено заданием.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'insertAdjacentHTML запрещён заданием.',
        },
        {
          selector: "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
          message: 'document.write запрещён заданием.',
        },
        {
          selector: "NewExpression[callee.name=/DOMParser/]",
          message: 'Разбор HTML-строк запрещён заданием.',
        },
        {
          selector: "CallExpression[callee.property.name='createContextualFragment']",
          message: 'Разбор HTML-строк запрещён заданием.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'alert', message: 'alert запрещён заданием.' },
        { name: 'confirm', message: 'confirm запрещён заданием.' },
        { name: 'prompt', message: 'prompt запрещён заданием.' },
      ],
    },
  },
];
