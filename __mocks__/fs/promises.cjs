/* eslint-disable @typescript-eslint/no-require-imports */

const { fs } = require("memfs");

// HACK: polyfill
fs.promises.exists = (p) => Promise.resolve(fs.existsSync(p));

module.exports = fs.promises;
