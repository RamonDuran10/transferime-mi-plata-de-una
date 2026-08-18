import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'legacy', 'node_modules']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Provider + hook conviven en el mismo archivo a propósito en este
      // proyecto (patrón estándar de Context) — solo afecta la granularidad
      // del Fast Refresh en dev, no es un bug.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // funciones serverless (Vercel) — CommonJS, entorno Node, no navegador
    files: ['api/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
])
