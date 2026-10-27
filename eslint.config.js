import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'supabase/functions'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Route table and shared style helpers intentionally export non-components.
    files: ['src/router.tsx', 'src/components/ui/Button.tsx', 'src/components/services/ServiceCard.tsx', 'src/components/characters/Companion.tsx', 'src/components/layout/Header.tsx', 'src/lib/auth.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  }
);
