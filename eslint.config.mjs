import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.tsbuildinfo",
      "**/generated/**",
      "docs/audits/frontend-work/**",
      "docs/audits/backend-work/backend-reference/**",
      "docs/ui-reference/replit-approved-code/**",
      "**/pnpm-lock.yaml",
      "**/*.mjs",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
);
