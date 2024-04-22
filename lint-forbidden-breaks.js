#!/usr/bin/env node

import { readFileSync } from "fs";
import path from "path";

let valid = true;

try {
  const forbiddenBreaks = readFileSync(
    path.join(process.cwd(), "latex/dictionaries/forbidden-breaks"),
    "utf8"
  );
  const words = forbiddenBreaks.split("\n");
  for (const word of words) {
    if (/[^\u0E00-\u0E7F]/.test(word)) {
      console.error(`Invalid forbidden-break word found: "${word}"`);
      valid = false;
    }
    if (words.filter((w) => w === word).length !== 1) {
      console.error(`Found word occurring multiple times: ${word}`);
      valid = false;
    }
  }
} catch (e) {
  console.error(e);
  valid = false;
}

if (valid) {
  console.log("All clear");
}
process.exit(valid ? 0 : 1);
