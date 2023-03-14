const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "dist", "esm");
fs.renameSync(path.join(dir, "index.js"), path.join(dir, "index.mjs"));
