import { createTextlintRule } from "../rule-factory.js";

// Rules that apply only to Markdown files, where {ref} syntax is used for
// reference codes and LaTeX commands appear in the text.
const ruleDefinitions = [
  {
    name: "no space before '{'",
    regexp: /(?<!(^|\s|\\emph|\\lw|\\p|\\thai|nbsp|\{\\;\}|\{\\:\})){(?!\\)/,
  },
  {
    name: "double ref codes",
    regexp: /(?<!;|:)\}\s*\{/,
  },
];

export default createTextlintRule(ruleDefinitions);
