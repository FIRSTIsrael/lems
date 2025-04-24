import { defineConfig, globalIgnores } from "eslint/config";
import nx from "@nx/eslint-plugin";
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

export default defineConfig([
    globalIgnores(["**/*", "**/node_modules", "apps/backend/webpack.config.js"]),
    {
        plugins: {
            "@nx": nx,
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],

        rules: {
            "@nx/enforce-module-boundaries": ["error", {
                enforceBuildableLibDependency: true,
                allow: [],

                depConstraints: [{
                    sourceTag: "*",
                    onlyDependOnLibsWithTags: ["*"],
                }],
            }],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        extends: compat.extends("plugin:@nx/typescript"),

        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.spec.js", "**/*.spec.jsx"],
        rules: {},
    },
]);