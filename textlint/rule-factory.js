import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RuleHelper } from "textlint-rule-helper";

function buildSnippet(text, index, length, context = 25) {
  const before = text.slice(Math.max(0, index - context), index).replace(/\n/g, " ");
  const matched = text.slice(index, index + length).replace(/\n/g, " ");
  const after = text.slice(index + length, index + length + context).replace(/\n/g, " ");
  const prefix = index > context ? "…" : "";
  const suffix = index + length + context < text.length ? "…" : "";
  return `${prefix}${before}*${matched}*${after}${suffix}`;
}

// Resolved relative to this file so it works regardless of CWD at import time.
const FORBIDDEN_TERMS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../forbidden_terms"
);

export const readForbiddenTerms = (language) =>
  fs
    .readFileSync(
      path.resolve(FORBIDDEN_TERMS_DIR, language),
      "utf-8"
    )
    .split("\n")
    .filter((l) => l && l.charAt(0) !== "#")
    .map((l) => l.split("#")[0].trim());

/**
 * Creates a textlint rule from an array of rule definitions.
 *
 * Each definition is one of:
 *   { name: string, regexp: RegExp }
 *   { name: string, test: (text: string, ctx: { isInBlockquote: boolean }) => number }
 *
 * The test function returns the match index (>= 0) to report an error, or -1 to pass.
 *
 * Rules are applied against Syntax.Str nodes, which naturally excludes inline code
 * spans, fenced code blocks, and (for Typst) raw blocks and comments.
 */
export const createTextlintRule = (ruleDefinitions) => (context) => {
  const { Syntax, report, RuleError, getSource, locator } = context;
  const helper = new RuleHelper(context);

  return {
    [Syntax.Str](node) {
      if (helper.isChildNode(node, [Syntax.Code, Syntax.CodeBlock])) return;

      const isInBlockquote = helper.isChildNode(node, [Syntax.BlockQuote]);
      const text = getSource(node);

      for (const rule of ruleDefinitions) {
        const { name, regexp, test } = rule;

        if (regexp) {
          const re = new RegExp(regexp.source, regexp.flags.includes("g") ? regexp.flags : regexp.flags + "g");
          let match;
          while ((match = re.exec(text)) !== null) {
            const snippet = buildSnippet(text, match.index, match[0].length);
            report(
              node,
              new RuleError(`Found: ${name} — ${snippet}`, {
                padding: locator.at(match.index),
              })
            );
          }
        } else if (test) {
          const index = test(text, { isInBlockquote });
          if (index >= 0) {
            report(
              node,
              new RuleError(`Found: ${name}`, {
                padding: locator.at(index),
              })
            );
          }
        }
      }
    },
  };
};
