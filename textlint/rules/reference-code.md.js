import { RuleHelper } from "textlint-rule-helper";

// Matches a properly-formed reference code at the end of a paragraph, e.g. {PP 1.1}
const REFERENCE_CODE_RE = /\{\w+ \d{1,3}\.\d{1,2}\}$/;

export default (context) => {
  const { Syntax, report, RuleError, getSource } = context;
  const helper = new RuleHelper(context);

  // Populated on Document enter — maps each node to its next sibling at that level.
  // Used to detect prose paragraphs that introduce a following blockquote (which
  // carries the reference code), e.g. "EGW writes:\n\n> 'Quote...' {PP 1.1}"
  const nextSiblingMap = new WeakMap();

  return {
    [Syntax.Document](docNode) {
      const children = docNode.children || [];
      children.forEach((child, i) => {
        nextSiblingMap.set(child, children[i + 1] || null);
      });
    },

    [Syntax.Paragraph](node) {
      // Skip paragraphs nested inside blockquotes (poetry) or list items
      if (helper.isChildNode(node, [Syntax.BlockQuote, Syntax.ListItem])) return;

      const source = getSource(node).trimEnd();

      // Skip paragraphs that are the content of a footnote definition: [^1]: text
      // The parent node type from remark is "footnoteDefinition" (not a TxtAST standard type).
      if (node.parent?.type === "footnoteDefinition") return;
      if (REFERENCE_CODE_RE.test(source)) return;

      // Exception: this paragraph introduces a following blockquote that carries
      // the reference code at the end of its own last line.
      const nextSibling = nextSiblingMap.get(node);
      if (nextSibling && nextSibling.type === Syntax.BlockQuote) return;

      report(
        node,
        new RuleError("Paragraph is missing a reference code {Word 1.1}", {
          index: source.length,
        })
      );
    },
  };
};
