import { createTextlintRule } from "../rule-factory.js";

const ruleDefinitions = [
  {
    name: "invalid spacing",
    test: (text, { isInBlockquote }) => {
      if (!text) return -1;
      const index = text.search(/\S\s{2,}($|\S)/);
      if (index === -1) return -1;
      if (isInBlockquote) return -1;
      return index;
    },
  },
  {
    name: "non-breaking whitespace",
    regexp: /\u00A0/,
  },
  {
    name: "missing space before opening curly quotes",
    regexp: /[^\s“\u2018\(\—…\}][“‘]/,
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
    name: "invalid space before closing curly quotes",
    regexp: /\s[”’]/,
  },
  {
    name: "missing space after closing curly quotes",
    regexp: /(\w”[^\s<’”—\[\)…;]|(?<![a-zA-Z])’[^\s<”—\.\[\)\{…;](?!s))/,
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

export default createTextlintRule(ruleDefinitions);
