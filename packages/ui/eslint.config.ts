import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser
    } 
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
