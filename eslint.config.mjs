import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier/recommended"

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
)
