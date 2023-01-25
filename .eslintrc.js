module.exports = {
  extends: [
    "react-app",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:prettier/recommended",
    "plugin:promise/recommended"
  ],
  plugins: ["react-hooks", "import", "prettier", "jsx-a11y", "promise"],
  settings: {
    "import/resolver": {
      node: {
        paths: ["src", "cypress"],
        extensions: [".d.ts", ".js"]
      }
    }
  },
  rules: {
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"]],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before"
          }
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true
        }
      }
    ],
    "import/export": "warn",
    "import/namespace": "warn",
    "no-template-curly-in-string": "off",
    "prettier/prettier": "warn",
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        "aspects": ["invalidHref"]
      }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn"
  }
};
