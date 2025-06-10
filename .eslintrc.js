/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"], // Make sure 'import' plugin is listed here
  extends: ["eslint:recommended", "next/core-web-vitals", "prettier"],
  rules: {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
          "object",
          "type"
        ],
        "pathGroups": [
          // Explicitly place React at the very top of external group (or even before it)
          // `pattern` is the module name, `group` is where it belongs, `position` sets order within that group
          {
            "pattern": "react",
            "group": "external",
            "position": "before" // Forces 'react' to come before other external imports
          },
          {
            "pattern": "@clerk/nextjs",
            "group": "external",
            "position": "after" // Forces '@clerk/nextjs' to come after 'react' within external
          },
          // All other external imports will go here, alphabetically by default.
          {
            "pattern": "next/**", // For other Next.js modules like 'next/image'
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "framer-motion",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "lucide-react",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "@/**", // Your internal aliases
            "group": "internal"
          },
          {
            "pattern": "./**", // Your relative imports
            "group": "sibling", // or "parent"
            "position": "after" // Put them at the end of the sibling group
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"], // Prevent react from being alphabetized with other externals
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "next/core-web-vitals",
        "prettier",
      ],
    },
  ],
};