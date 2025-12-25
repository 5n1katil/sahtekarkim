const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs").default;
const resolve = require("@rollup/plugin-node-resolve").default;

const createPlugins = () => [
  resolve({ browser: true, preferBuiltins: false }),
  commonjs(),
  babel({
    babelHelpers: "bundled",
    presets: [["@babel/preset-env", { targets: "> 0.25%, not dead" }]],
    exclude: "node_modules/**",
  }),
];

module.exports = [
  {
    input: "main.js",
    output: {
      file: "main.nomodule.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: createPlugins(),
  },
  {
    input: "firebase.js",
    output: {
      file: "firebase.bundle.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: createPlugins(),
  },
];
