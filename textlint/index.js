#!/usr/bin/env node

process.chdir("../");

import { globby } from "globby";
import fs from "fs";
import path from "path";
import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import _markdownPlugin from "@textlint/textlint-plugin-markdown";
import typstPlugin from "./typst-plugin.js";

// markdownPlugin is CJS with a `export default { Processor }` shape that gains
// an extra .default wrapper when imported via ESM interop.
const markdownPlugin = _markdownPlugin.default ?? _markdownPlugin;

import commonRule from "./rules/common.js";
import commonMdRule from "./rules/common.md.js";
import thRule from "./rules/th.js";
import thEditRule from "./rules/th-edit.js";
import loRule from "./rules/lo.js";
import publicRule from "./rules/public.js";
import referenceCodeMdRule from "./rules/reference-code.md.js";
import referenceCodeTypRule from "./rules/reference-code.typ.js";

// ---------------------------------------------------------------------------
// Metadata helpers
// ---------------------------------------------------------------------------

const metadataCache = {};
const checkMetadataForSetting = (filename, setting) => {
  const bookPath = path.dirname(path.dirname(filename));
  if (!metadataCache[bookPath]) {
    try {
      metadataCache[bookPath] = fs.readFileSync(
        path.join(bookPath, "metadata.yaml"),
        "utf-8",
      );
    } catch {
      metadataCache[bookPath] = "";
    }
  }
  return metadataCache[bookPath].indexOf(setting) !== -1;
};

// ---------------------------------------------------------------------------
// Glob helpers
// ---------------------------------------------------------------------------

const BASE_EXCLUDES = [
  "!node_modules/**",
  "!source/**",
  "!**/00_source/**",
  "!**/001_machineraw/**",
  "!**/README.md",
  "!**/tests/**",
  "!**/assets/**",
  "!**/AA/**", // TODO: fix up the AA errors and re-enable this check for AA
];

const buildGlobPatterns = (globPath, negativeGlobPath, fileTypes) => {
  const patterns = [];
  if (fileTypes === "both" || fileTypes === "md")
    patterns.push(`${globPath}*.md`);
  if (fileTypes === "both" || fileTypes === "typ")
    patterns.push(`${globPath}*.typ`);
  patterns.push(...BASE_EXCLUDES);
  if (negativeGlobPath) {
    if (fileTypes === "both" || fileTypes === "md")
      patterns.push(`${negativeGlobPath}*.md`);
    if (fileTypes === "both" || fileTypes === "typ")
      patterns.push(`${negativeGlobPath}*.typ`);
  }
  return patterns;
};

// ---------------------------------------------------------------------------
// Descriptor helpers
// ---------------------------------------------------------------------------

const buildDescriptor = (rules, fileTypes) => {
  const plugins = [];
  if (fileTypes === "both" || fileTypes === "md") {
    plugins.push({ pluginId: "@textlint/markdown", plugin: markdownPlugin });
  }
  if (fileTypes === "both" || fileTypes === "typ") {
    plugins.push({ pluginId: "typst", plugin: typstPlugin });
  }
  return new TextlintKernelDescriptor({
    rules: rules.map(({ ruleId, rule }) => ({ ruleId, rule, options: true })),
    plugins,
    filterRules: [],
  });
};

// ---------------------------------------------------------------------------
// Check definitions
// ---------------------------------------------------------------------------

const CHECKS = [
  {
    label: "common (all files)",
    globPath: "./**/",
    fileTypes: "both",
    rules: [{ ruleId: "common", rule: commonRule }],
  },
  {
    label: "common (markdown-only rules)",
    globPath: "./**/",
    fileTypes: "md",
    rules: [{ ruleId: "common-md", rule: commonMdRule }],
  },
  {
    label: "public stage",
    globPath: "./**/03_public/",
    fileTypes: "both",
    rules: [{ ruleId: "public", rule: publicRule }],
  },
  {
    label: "Lao files",
    globPath: "./lo/**/",
    fileTypes: "both",
    rules: [{ ruleId: "lo", rule: loRule }],
  },
  {
    label: "Thai files",
    globPath: "./th/**/",
    fileTypes: "both",
    rules: [{ ruleId: "th", rule: thRule }],
  },
  {
    label: "Thai non-raw files",
    globPath: "./th/**/",
    negativeGlobPath: "!./th/**/01_raw/",
    fileTypes: "both",
    rules: [{ ruleId: "th-edit", rule: thEditRule }],
  },
  {
    label: "reference codes (md)",
    globPath: "./**/",
    fileTypes: "md",
    fileFilter: (filename) =>
      !checkMetadataForSetting(filename, "optional_reference_codes") &&
      filename.search("/assets/") === -1 &&
      filename.search("GC00_introduction_lo.md") === -1,
    rules: [{ ruleId: "reference-code-md", rule: referenceCodeMdRule }],
  },
  {
    label: "reference codes (typ)",
    globPath: "./**/",
    fileTypes: "typ",
    fileFilter: (filename) =>
      !checkMetadataForSetting(filename, "optional_reference_codes") &&
      filename.search("/assets/") === -1,
    rules: [{ ruleId: "reference-code-typ", rule: referenceCodeTypRule }],
  },
];

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------

const formatResults = (results) => {
  const lines = [];
  for (const result of results) {
    for (const msg of result.messages) {
      lines.push(
        `${result.filePath}:${msg.line}:${msg.column}: ${msg.message} [${msg.ruleId}]`,
      );
    }
  }
  return lines.join("\n");
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  let allClear = true;

  for (const {
    label,
    globPath,
    negativeGlobPath,
    fileTypes,
    rules,
    fileFilter,
  } of CHECKS) {
    const patterns = buildGlobPatterns(globPath, negativeGlobPath, fileTypes);
    let files = await globby(patterns);
    if (fileFilter) files = files.filter(fileFilter);

    console.log(`Linting ${files.length} files: ${label}`);
    if (files.length === 0) continue;

    const descriptor = buildDescriptor(rules, fileTypes);
    const linter = createLinter({ descriptor });
    const results = await linter.lintFiles(files);
    const output = formatResults(results.filter((r) => r.messages.length > 0));
    if (output) {
      console.log(output);
      allClear = false;
    }
  }

  if (allClear) {
    console.log("All clear!");
  } else {
    process.exit(1);
  }
})();
