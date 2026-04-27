// textlint-plugin-typst AST structure for `prose text #EGW[\{PP 438.1\}]`:
//
//   Document
//     Paragraph          ← prose text (parent=Document)
//     Fn::#              ← the '#' character
//     Marked::FuncCall   ← "EGW[\{PP 438.1\}]"
//       Fn::Ident        ← "EGW"
//       Marked::Args
//         Paragraph      ← "\{PP 438.1\}" (parent=Marked::Args)
//           Code         ← "\{"
//           Str          ← "PP 438.1"
//           Code         ← "\}"
//
// Rule 1 (presence): every top-level Paragraph must be immediately followed by
//   Fn::# + Marked::FuncCall whose source starts with "EGW[".
//
// Rule 2 (content): every Marked::FuncCall starting with "EGW[" must have
//   content matching \{Word digits.digits\}.

const VALID_CONTENT_RE = /^\\{\w+ \d{1,3}\.\d{1,2}\\}$/;

export default (context) => {
  const { Syntax, report, RuleError, getSource } = context;

  return {
    [Syntax.Document](docNode) {
      const children = docNode.children || [];
      children.forEach((child) => {
        if (child.type !== Syntax.Paragraph) return;

        // Skip Typst comment-line annotations (e.g. "// {PP 746.2}").
        // The plugin may return the raw source "// {PP 746.2}" or just the
        // comment content " {PP 746.2}" depending on how it handles Typst's
        // "//" comment syntax, so we check for both forms.
        const src = getSource(child);
        if (
          src.trimStart().startsWith("//") ||
          /^\s*\{[A-Z]+\s+\d+\.\d+\}\s*$/.test(src)
        )
          return;

        // #EGW[...] is parsed as a Marked::FuncCall child of the Paragraph node.
        const hasRefCode = (child.children || []).some(
          (n) => n.type === "Marked::FuncCall" && getSource(n).startsWith("EGW[")
        );

        if (!hasRefCode) {
          const source = getSource(child);
          report(
            child,
            new RuleError(
              "Paragraph is missing a reference code #EGW[\\{Word 1.1\\}]",
              { index: source.trimEnd().length }
            )
          );
        }
      });
    },

    // Rule 2: validate the content inside every #EGW[...] call
    ["Marked::FuncCall"](node) {
      const source = getSource(node);
      if (!source.startsWith("EGW[")) return;

      const match = source.match(/^EGW\[([^\]]*)\]/);
      if (!match) return;

      const content = match[1];
      if (!VALID_CONTENT_RE.test(content)) {
        report(
          node,
          new RuleError(
            `Invalid reference code content: #EGW[${content}] — expected \\{Word 1.1\\}`,
            { index: 0 }
          )
        );
      }
    },
  };
};
