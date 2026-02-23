import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooks.configs.flat['recommended-latest'],
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: globals.browser
    },
    settings: {
      react: { version: 'detect' }
    }
  }
]
