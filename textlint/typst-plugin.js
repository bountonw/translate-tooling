// Lightweight textlint processor plugin for Typst (.typ) files.
// Handles the subset of Typst syntax used in this project without WASM.
//
// Supported constructs:
//   Block:  = headings, // comments, /* */ comments, #chapter() metadata,
//           #quote(block:true)[...] blockquotes, #let assignments,
//           ``` fenced code blocks, blank-line-delimited paragraphs
//   Inline: `code`, /* */ comments, // comments, #funcname[...] calls
//           (content linted for #footnote, skipped for all others),
//           \escape sequences

// ---------------------------------------------------------------------------
// Position utilities
// ---------------------------------------------------------------------------

/**
 * Build an array where lineOffsets[i] is the character offset of the start
 * of line i+1 (lines are 1-indexed; array is 0-indexed).
 */
function buildLineOffsets(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") offsets.push(i + 1);
  }
  return offsets;
}

/** Convert a character offset to { line, column } (1-indexed line, 0-indexed column). */
function offsetToLoc(offset, lineOffsets) {
  let lo = 0,
    hi = lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineOffsets[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: offset - lineOffsets[lo] };
}

function mkNode(type, raw, start, end, lineOffsets, extra = {}) {
  return {
    type,
    raw,
    loc: {
      start: offsetToLoc(start, lineOffsets),
      end: offsetToLoc(end, lineOffsets),
    },
    range: [start, end],
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Bracket matching
// ---------------------------------------------------------------------------

/**
 * Find the matching closing bracket/paren starting from openPos (the opening
 * character), handling nesting. Returns index of the closing character, or -1.
 * Skips Typst string literals ("...") so brackets inside strings don't affect
 * the depth count.
 */
function matchClose(text, openPos, openCh, closeCh) {
  let depth = 1;
  let i = openPos + 1;
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === '"') {
      // Skip over string literal, respecting backslash escapes
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") i++;
        i++;
      }
      i++; // step past closing "
      continue;
    }
    if (ch === openCh) depth++;
    else if (ch === closeCh) depth--;
    i++;
  }
  return depth === 0 ? i - 1 : -1;
}

// ---------------------------------------------------------------------------
// Inline parser
// ---------------------------------------------------------------------------

// Functions whose [...] content should be linted as prose
const PROSE_FN = new Set(["footnote"]);

// Functions that produce a Marked::FuncCall node in the AST (for structural rules)
const FUNC_CALL_FN = new Set(["EGW"]);

/**
 * Parse inline content within [start, end) of `text`.
 * Returns an array of textlint AST nodes (Str, Code, CodeBlock).
 * Non-prose function calls, comments, and escape sequences are consumed
 * without producing nodes.
 */
function parseInline(text, start, end, lineOffsets) {
  const nodes = [];
  let pos = start;
  let strStart = start;

  function flushStr(to) {
    if (strStart < to) {
      const raw = text.slice(strStart, to);
      if (raw.trim()) {
        nodes.push(mkNode("Str", raw, strStart, to, lineOffsets, { value: raw }));
      }
    }
    strStart = to;
  }

  while (pos < end) {
    const ch = text[pos];

    // Fenced raw block: ```...```
    if (ch === "`" && text[pos + 1] === "`" && text[pos + 2] === "`") {
      flushStr(pos);
      const close = text.indexOf("```", pos + 3);
      const blockEnd = close === -1 ? end : close + 3;
      nodes.push(
        mkNode("CodeBlock", text.slice(pos, blockEnd), pos, blockEnd, lineOffsets, {})
      );
      pos = blockEnd;
      strStart = pos;
      continue;
    }

    // Inline raw: `...`
    if (ch === "`") {
      flushStr(pos);
      const close = text.indexOf("`", pos + 1);
      const codeEnd = close === -1 ? end : close + 1;
      nodes.push(
        mkNode("Code", text.slice(pos, codeEnd), pos, codeEnd, lineOffsets, {
          value: text.slice(pos + 1, codeEnd - 1),
        })
      );
      pos = codeEnd;
      strStart = pos;
      continue;
    }

    // Block comment: /* ... */
    if (ch === "/" && text[pos + 1] === "*") {
      flushStr(pos);
      const close = text.indexOf("*/", pos + 2);
      pos = close === -1 ? end : close + 2;
      strStart = pos;
      continue;
    }

    // Line comment: // ...
    if (ch === "/" && text[pos + 1] === "/") {
      flushStr(pos);
      const nl = text.indexOf("\n", pos);
      pos = nl === -1 ? end : nl + 1;
      strStart = pos;
      continue;
    }

    // Function call: #name, #name(...), #name[...], #name(...)[...]
    if (ch === "#") {
      const nameMatch = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(
        text.slice(pos + 1, pos + 64)
      );
      if (nameMatch) {
        const funcName = nameMatch[0];
        flushStr(pos);
        let cur = pos + 1 + funcName.length;

        // Consume optional (...)
        if (cur < text.length && text[cur] === "(") {
          const closeP = matchClose(text, cur, "(", ")");
          cur = closeP === -1 ? end : closeP + 1;
        }

        // Consume optional [...]
        if (cur < text.length && text[cur] === "[") {
          const closeB = matchClose(text, cur, "[", "]");
          const contentStart = cur + 1;
          const contentEnd = closeB === -1 ? end : closeB;
          cur = closeB === -1 ? end : closeB + 1;

          if (PROSE_FN.has(funcName)) {
            nodes.push(...parseInline(text, contentStart, contentEnd, lineOffsets));
          } else if (FUNC_CALL_FN.has(funcName)) {
            // Emit a Marked::FuncCall node; raw starts after '#' so getSource()
            // returns "EGW[...]", matching what reference-code.typ.js expects.
            nodes.push(
              mkNode("Marked::FuncCall", text.slice(pos + 1, cur), pos + 1, cur, lineOffsets, {})
            );
          }
        }

        pos = cur;
        strStart = pos;
        continue;
      }

      // Anonymous content block: #[...]
      if (text[pos + 1] === "[") {
        flushStr(pos);
        const closeB = matchClose(text, pos + 1, "[", "]");
        pos = closeB === -1 ? end : closeB + 1;
        strStart = pos;
        continue;
      }
    }

    // Escape sequence: \char — skip both characters, include them in next Str flush
    if (ch === "\\" && pos + 1 < end) {
      pos += 2;
      continue;
    }

    pos++;
  }

  flushStr(end);
  return nodes;
}

// ---------------------------------------------------------------------------
// Block parser
// ---------------------------------------------------------------------------

function parse(text) {
  // Normalize line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const lineOffsets = buildLineOffsets(text);
  const len = text.length;
  const children = [];
  let pos = 0;

  while (pos < len) {
    // Find end of current line
    const nlPos = text.indexOf("\n", pos);
    const lineEnd = nlPos === -1 ? len : nlPos;
    const lineText = text.slice(pos, lineEnd);
    const trimmed = lineText.trimStart();

    // Skip blank lines
    if (trimmed === "") {
      pos = lineEnd + 1;
      continue;
    }

    const indent = lineText.length - trimmed.length;

    // Line comment: //
    if (trimmed.startsWith("//")) {
      children.push(mkNode("Comment", lineText, pos, lineEnd, lineOffsets, {}));
      pos = lineEnd + 1;
      continue;
    }

    // Block comment: /* ... */
    if (trimmed.startsWith("/*")) {
      const closePos = text.indexOf("*/", pos + 2);
      const commentEnd = closePos === -1 ? len : closePos + 2;
      children.push(
        mkNode("Comment", text.slice(pos, commentEnd), pos, commentEnd, lineOffsets, {})
      );
      pos = commentEnd;
      if (pos < len && text[pos] === "\n") pos++;
      continue;
    }

    // Fenced code block: ```...```
    if (trimmed.startsWith("```")) {
      const fenceStart = pos + indent;
      const closePos = text.indexOf("```", fenceStart + 3);
      const codeEnd = closePos === -1 ? len : closePos + 3;
      children.push(
        mkNode("CodeBlock", text.slice(pos, codeEnd), pos, codeEnd, lineOffsets, {})
      );
      pos = codeEnd;
      if (pos < len && text[pos] === "\n") pos++;
      continue;
    }

    // Heading: = / == / === ...
    const headingMatch = /^(=+)\s+(.+)/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingContentStart = pos + indent + level + 1; // skip "=+ " prefix
      const inlineNodes = parseInline(text, headingContentStart, lineEnd, lineOffsets);
      children.push(
        mkNode("Header", lineText, pos, lineEnd, lineOffsets, {
          depth: level,
          children: inlineNodes,
        })
      );
      pos = lineEnd + 1;
      continue;
    }

    // Block-level #function(...)
    if (trimmed.startsWith("#")) {
      const nameMatch = /^#([a-zA-Z_][a-zA-Z0-9_]*)/.exec(trimmed);
      if (nameMatch) {
        const funcName = nameMatch[1];
        let cur = pos + indent + 1 + funcName.length;

        if (funcName === "let") {
          // #let: variable assignment, skip to end of line
          pos = lineEnd + 1;
          continue;
        }

        if (funcName === "chapter") {
          // #chapter(...): multi-line metadata block, skip entirely
          const openP = text.indexOf("(", pos);
          if (openP !== -1 && openP < pos + 12) {
            const closeP = matchClose(text, openP, "(", ")");
            pos = closeP === -1 ? lineEnd + 1 : closeP + 1;
          } else {
            pos = lineEnd + 1;
          }
          if (pos < len && text[pos] === "\n") pos++;
          continue;
        }

        if (funcName === "quote") {
          // #quote(block: true)[...]: blockquote
          // Consume optional (...)
          if (cur < len && text[cur] === "(") {
            const closeP = matchClose(text, cur, "(", ")");
            cur = closeP === -1 ? lineEnd : closeP + 1;
          }
          if (cur < len && text[cur] === "[") {
            const closeB = matchClose(text, cur, "[", "]");
            const contentStart = cur + 1;
            const contentEnd = closeB === -1 ? len : closeB;
            const quoteEnd = closeB === -1 ? len : closeB + 1;
            const innerNodes = parseInline(
              text,
              contentStart,
              contentEnd,
              lineOffsets
            );
            children.push(
              mkNode(
                "BlockQuote",
                text.slice(pos, quoteEnd),
                pos,
                quoteEnd,
                lineOffsets,
                { children: innerNodes }
              )
            );
            pos = quoteEnd;
          } else {
            pos = lineEnd + 1;
          }
          if (pos < len && text[pos] === "\n") pos++;
          continue;
        }

        // Other block-level #function: skip (consume optional (...) then [...])
        if (cur < len && text[cur] === "(") {
          const closeP = matchClose(text, cur, "(", ")");
          cur = closeP === -1 ? lineEnd + 1 : closeP + 1;
        }
        if (cur < len && text[cur] === "[") {
          const closeB = matchClose(text, cur, "[", "]");
          cur = closeB === -1 ? len : closeB + 1;
        } else {
          cur = lineEnd + 1;
        }
        pos = cur;
        if (pos < len && text[pos] === "\n") pos++;
        continue;
      }
    }

    // Regular paragraph: collect consecutive non-blank lines
    const paraStart = pos;
    let paraLineEnd = pos;
    while (pos < len) {
      const nlPos2 = text.indexOf("\n", pos);
      const lineEndPos = nlPos2 === -1 ? len : nlPos2;
      const lineTrimmed = text.slice(pos, lineEndPos).trimStart();
      if (lineTrimmed === "") break;
      // A line starting with a block-level function call ends the paragraph
      if (pos > paraStart && /^#[a-zA-Z_]/.test(lineTrimmed)) break;
      paraLineEnd = lineEndPos;
      pos = lineEndPos + 1;
    }

    const inlineNodes = parseInline(text, paraStart, paraLineEnd, lineOffsets);
    if (inlineNodes.length > 0) {
      children.push(
        mkNode(
          "Paragraph",
          text.slice(paraStart, paraLineEnd),
          paraStart,
          paraLineEnd,
          lineOffsets,
          { children: inlineNodes }
        )
      );
    }
  }

  return {
    type: "Document",
    raw: text,
    children,
    loc: {
      start: { line: 1, column: 0 },
      end: offsetToLoc(len, lineOffsets),
    },
    range: [0, len],
  };
}

// ---------------------------------------------------------------------------
// textlint Processor
// ---------------------------------------------------------------------------

class TypstProcessor {
  availableExtensions() {
    return [".typ"];
  }

  processor(_ext) {
    return {
      preProcess(text, _filePath) {
        return parse(text);
      },
      postProcess(messages, filePath) {
        return { messages, filePath };
      },
    };
  }
}

export default { Processor: TypstProcessor };
