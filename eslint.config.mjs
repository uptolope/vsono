import js from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default typescriptEslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/**",
      "scripts/**",
      "test-email.js",
    ],
  },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_" },
      ],
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "warn",
    },
  }
);
