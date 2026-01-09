import { applyCustomFormattingRules } from "./helpers.js";

const customFormattingRules = [
  {
    name: "invalid spacing",
    test: (line) => {
      const doubleSpaceIndex = line ? line.search(/\S\s{2,}($|\S)/) : -1;
      if (doubleSpaceIndex !== -1) {
        const isAllowedDoubleSpaceForPoetry =
          line.search(/>\s/) !== -1 &&
          line
            .replace(/^>/, "")
            .trim()
            .search(/\S\s{2,}($|\S)/) === -1;
        return isAllowedDoubleSpaceForPoetry ? -1 : doubleSpaceIndex;
      }
      return -1;
    },
  },
  {
    name: "non-breaking whitespace",
    regexp: / /,
  },
  {
    name: "no space before '{'",
    regexp: /(?<!(^|\s|\\emph|\\lw|\\p|\\thai|nbsp|\{\\;\}|\{\\:\})){(?!\\)/,
  },
  {
    name: "double ref codes",
    regexp: /(?<!;|:)\}\s*\{/,
  },
  {
    name: "missing space before opening curly quotes",
    regexp: /[^\s“‘\(\—…\}][“‘]/,
  },
  {
    name: "invalid space after opening curly quotes",
    regexp: /[“‘]\s/,
  },
  {
    name: "invalid space before closing curly quotes",
    regexp: /\s[”’]/,
  },
  {
    name: "missing space after closing curly quotes",
    regexp: /(\w”[^\s<’”—\[\)…;]|(?<![a-z])’[^\s<”—\.\[\)…;](?!s))/,
  },
  {
    name: "periods instead of ellipsis",
    regexp: /\.\s*?\.\s*?\.(?![\s\.]*\-\-\>)/,
  },
  {
    name: "semicolon followed by a number",
    regexp: /;\d/,
  },
  {
    name: "hyphen instead of en-dash",
    regexp: /\d(-|—)\d/,
  },
  {
    name: "missing space after numbers",
    regexp: /\d[a-z\u0E00-\u0E7F\u0E80-\u0EFF]/, // The Unicode ranges for Thai and Lao, respectively, per https://www.herongyang.com/Unicode-Blocks/Block-U0E00-Thai.html and https://www.herongyang.com/Unicode-Blocks/Block-U0E80-Lao.html
  },
];

const CustomFormatting = {
  names: ["custom-formatting"],
  description: "Custom formatting rules",
  tags: ["style"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
