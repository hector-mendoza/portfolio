import { defineConfig, globalIgnores } from "eslint/config";
import babelParser from "@babel/eslint-parser";
import globals from "globals";

const canvasRule = {
  "no-restricted-syntax": [
    "error",
    {
      selector: "JSXOpeningElement[name.name='canvas']",
      message:
        "Do not use <canvas> outside components/scene/LivingCanvas.tsx. Use LivingCanvas for the living WebGL scene.",
    },
  ],
};

const babelLanguageOptions = {
  parser: babelParser,
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: [
        ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
        "@babel/preset-react",
      ],
    },
  },
  globals: { ...globals.browser, ...globals.node },
};

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "public/**", "**/*.d.ts"]),
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      ...babelLanguageOptions,
    },
    rules: {
      ...canvasRule,
      "no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["components/scene/LivingCanvas.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    files: [
      "components/ClickSpark.jsx",
      "components/vibe-easter-egg.jsx",
      "components/emoji-day-easter-egg.jsx",
      "components/geometry-wars-game.jsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);
