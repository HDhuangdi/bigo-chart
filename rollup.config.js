import babel from "rollup-plugin-babel"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import img from "@rollup/plugin-image"
import { terser } from "rollup-plugin-terser"
import { eslint } from "rollup-plugin-eslint"

export default {
  input: "src/QuoteChart.js",
  output: [
    { file: "dist/index.js", format: "iife", name: "QuoteChart" },
    { file: "dist/index.esm.js", format: "esm" },
    { file: "dist/index.umd.js", format: "umd", name: "QuoteChart" },
    { file: "dist/index.amd.js", format: "amd" },
    { file: "dist/index.cjs.js", format: "cjs" },
  ],

  plugins: [
    img(),
    resolve(),
    commonjs(),
    eslint(),
    babel({ runtimeHelpers: true }),
    terser(),
  ],
}
