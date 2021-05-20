import babel from "rollup-plugin-babel"
import path from "path"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import img from "@rollup/plugin-image"
import { terser } from "rollup-plugin-terser"
import { eslint } from "rollup-plugin-eslint"
import postcss from "rollup-plugin-postcss"

export default {
  input: "src/Chart.js",
  output: [
    { file: "dist/index.js", format: "iife", name: "BigoChart" },
    { file: "dist/index.esm.js", format: "esm" },
    { file: "dist/index.umd.js", format: "umd", name: "BigoChart" },
    { file: "dist/index.amd.js", format: "amd" },
    { file: "dist/index.cjs.js", format: "cjs" },
  ],

  plugins: [
    postcss({
      extensions: [".css"],
      extract: true,
      extract: path.resolve("dist/chart.css"),
    }),
    img(),
    resolve(),
    commonjs(),
    eslint(),
    babel({ runtimeHelpers: true }),
    terser(),
  ],
}
