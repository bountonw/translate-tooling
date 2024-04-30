#!/usr/bin/env node

process.chdir("../");

import { globby } from "globby";
import fs from "fs";
import path from "path";
import markdownlint from "markdownlint";

const metadataCache = {};
const checkMetadataForSetting = (filename, setting) => {
  const bookPath = path.dirname(path.dirname(filename));
  if (!metadataCache[bookPath]) {
    metadataCache[bookPath] = fs.readFileSync(
      path.join(bookPath, "metadata.yaml"),
      "utf-8"
    );
  }
  return metadataCache[bookPath].indexOf(setting) !== -1;
};

const GLOBAL_CONFIG = {
  "fenced-code-language": false,
  "line-length": false,
  "no-bare-urls": false,
  "no-duplicate-heading": false,
  "no-inline-html": false,
  "no-trailing-punctuation": false,
  "no-blanks-blockquote": false,
  "ol-prefix": false,
  "single-trailing-newline": false,
  "heading-style": {
    style: "atx",
  },
  "emphasis-style": {
    style: "asterisk",
  },
  "strong-style": {
    style: "asterisk",
  },
};

const CHECKS = [
  {
    globPath: "./**/",
    customFormatting: "custom-formatting.js",
    config: GLOBAL_CONFIG,
  },
  {
    globPath: "./**/03_public/",
    customFormatting: "custom-formatting-public.js",
    config: {
      default: false,
    },
  },
  {
    globPath: "./lo/**/",
    customFormatting: "custom-formatting.lo.js",
    config: {
      default: false,
    },
  },
  {
    globPath: "./th/**/",
    customFormatting: "custom-formatting.th.js",
    config: {
      default: false,
    },
  },
  {
    globPath: "./th/**/03_public/",
    customFormatting: "custom-formatting-public.th.js",
    config: {
      default: false,
    },
  },
  {
    globPath: "./**/",
    fileFilter: (filename) => {
      return (
        !checkMetadataForSetting(filename, "optional_reference_codes") &&
        filename.search("/assets/") === -1 // Ignore assets files
      );
    },
    customFormatting: "custom-formatting-reference-code.js",
    config: {
      default: false,
    },
  },
];

(async () => {
  let allClear = true;
  for (const { globPath, customFormatting, config, fileFilter } of CHECKS) {
    const paths = await globby([
      `${globPath}*.md`,
      "!node_modules",
      "!source/**/*.md",
      "!**/00_source/*.md",
      "!**/001_machineraw/*.md",
      "!**/README.md",
    ]);
    console.log(`Linting ${paths.length} files in "${globPath}"`);
    let customRules = [];
    if (customFormatting) {
      const { default: customRule } = await import(`./${customFormatting}`);
      customRules = [customRule];
    }
    const options = {
      files: fileFilter ? paths.filter(fileFilter) : paths,
      config: {
        ...config,
        ...(customRules.length && {
          [customRules[0].names[0]]: true,
        }),
      },
      customRules,
    };

    const result = markdownlint.sync(options);
    const stringResult = result.toString();
    if (stringResult) {
      console.log(stringResult);
      allClear = false;
    }
  }
  if (allClear) {
    console.log("All clear!");
  } else {
    process.exit(1);
  }
})();
