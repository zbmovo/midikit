import path from "path"
import babel from "@rollup/plugin-babel"
import terser from "@rollup/plugin-terser"
import resolve from "@rollup/plugin-node-resolve"

const name = "midikit-synth"
const extensions = [".ts", ".js"]
function joinRoot(...paths) {
  return path.join(import.meta.dirname, ...paths)
}

/**
 * Rollup config
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "./src/index.ts",
  output: [
    {
      format: "esm",
      file: joinRoot("dist/index.mjs"),
      sourcemap: true,
    },
    {
      name,
      format: "umd",
      file: joinRoot("dist/index.js"),
      sourcemap: true,
    },
    {
      name,
      format: "umd",
      file: joinRoot("dist/index.min.js"),
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve({ extensions }),
    babel({
      extensions,
      babelHelpers: "bundled",
    }),
  ],
}
