import { defineConfig, globalIgnores } from "eslint/config";
import microsoftSdl from "@microsoft/eslint-plugin-sdl";
import tseslint from "typescript-eslint";

const eslintSdlConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "app/dev/script/**",
  ]),
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@microsoft/sdl": microsoftSdl,
    },
    rules: {
      "@microsoft/sdl/no-insecure-url": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@microsoft/sdl": microsoftSdl,
    },
    rules: {
      "@microsoft/sdl/no-insecure-url": "error",
    },
  },
]);

export default eslintSdlConfig;
