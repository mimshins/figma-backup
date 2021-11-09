module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  env: {
    es6: true,
    node: true,
    commonjs: true
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  plugins: ["eslint-plugin-import", "@typescript-eslint/eslint-plugin"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module"
  },
  rules: {
    "no-alert": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "default-case": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ]
  },
  overrides: [
    {
      files: ["*.ts", "*.d.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      parserOptions: {
        sourceType: "module",
        project: ["./tsconfig.json"]
      }
    }
  ],
  settings: {
    "import/resolver": {
      node: { paths: ["./bin"] }
    }
  }
};
