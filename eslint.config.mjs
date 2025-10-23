import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import noSmartQuotesRule from "./eslint-rules/no-smart-quotes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**/*",
      "prisma/generated/**/*",
      "**/*.generated.*",
      "eslint-rules/**", // Ignore custom ESLint rules directory
    ],
  },
  {
    plugins: {
      "custom": {
        rules: {
          "no-smart-quotes": noSmartQuotesRule,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // Detect smart quotes and invalid unicode characters
      "no-irregular-whitespace": ["error", {
        "skipStrings": false,
        "skipComments": false,
        "skipRegExps": false,
        "skipTemplates": false
      }],
      // Prevent smart/curly quotes (custom rule)
      "custom/no-smart-quotes": "error",
      // Note: quotes rule is disabled to allow both single and double quotes
      // The important thing is to prevent SMART quotes, not enforce quote style
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      // Additional check for non-ASCII quotes
      "no-misleading-character-class": "error",
    },
  },
];

export default eslintConfig;
