const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs").default;
const resolve = require("@rollup/plugin-node-resolve").default;

module.exports = {
  input: "main.js",
  output: {
    file: "main.nomodule.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      presets: [["@babel/preset-env", { targets: "> 0.25%, not dead" }]],
      exclude: "node_modules/**",
    }),
  ],
};
