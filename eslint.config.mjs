import promise from "eslint-plugin-promise";
import eslintComments from "eslint-plugin-eslint-comments";
import html from "eslint-plugin-html";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:promise/recommended",
    "plugin:eslint-comments/recommended",
), {
    plugins: {
        promise,
        "eslint-comments": eslintComments,
        html,
    },
    
    ignores: ["eslint.config.mjs"],

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.webextensions,
            exportFunction: false,
        },

        ecmaVersion: 2022,
        sourceType: "script",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    rules: {
        "brace-style": ["error", "stroustrup", {
            allowSingleLine: true,
        }],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        complexity: ["warn", 20],
        "consistent-return": "error",
        "constructor-super": "warn",
        eqeqeq: "error",

        "eslint-comments/no-use": ["error", {
            allow: ["globals"],
        }],

        indent: ["error", "tab", {
            SwitchCase: 1,
        }],

        "max-depth": ["warn", 4],

        "max-len": ["warn", {
            code: 120,
            tabWidth: 4,
        }],

        "max-lines-per-function": ["warn", {
            max: 80,
            skipBlankLines: true,
            skipComments: true,
        }],

        "max-lines": ["warn", {
            max: 1500,
            skipBlankLines: true,
            skipComments: true,
        }],

        "max-params": ["warn", 4],
        "no-console": "off",
        "no-const-assign": "error",
        "no-inner-declarations": "warn",
        "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        "no-prototype-builtins": "off",
        "no-this-before-super": "warn",

        "no-trailing-spaces": ["error", {
            skipBlankLines: true,
        }],

        "no-undef": "error",
        "no-unreachable": "warn",
        "no-unused-vars": "off",

        "no-use-before-define": ["error", {
            functions: false,
        }],

        "no-useless-rename": "warn",
        "no-useless-return": "warn",
        "no-var": "error",
        quotes: ["error", "double"],
        "require-atomic-updates": "off",
        semi: ["error", "always"],
        "space-in-parens": ["error", "never"],
        strict: ["error", "global"],
        "valid-typeof": "warn",
    },
}, {
    files: ["test/*"],

    rules: {
        "no-console": "off",
    },
}, {
    files: [".tools/*.js"],

    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        "no-console": "off",
    },
}];