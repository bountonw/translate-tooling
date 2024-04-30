import { applyCustomFormattingRules } from "./helpers.js";

const CustomFormatting = {
  names: ["custom-formatting-reference-code"],
  description: "Custom formatting rule for checking proper reference codes",
  tags: ["style"],
  function: applyCustomFormattingRules([
    {
      name: "invalid reference code",
      test: (line, params) => {
        if (
          line &&
          line.search(/^(?!(#+|\{|\[\^\d\]|\s{4}|$)|> > > > >)/) === 0
        ) {
          const { lines } = params;
          const lineIndex = lines.findIndex((l) => l === line);
          const nextLine = lines[lineIndex + 1] || lines[lineIndex + 2];
          const isFollowingLinePoetry =
            nextLine && nextLine.search(/^(>(\s|$)|\s{4,}\S+)/) === 0;
          return isFollowingLinePoetry ||
            line.search(/\{\w+ \d{1,3}\.\d{1,2}\}$/) >= 0
            ? -1
            : line.length - 1;
        }
        return -1;
      },
    },
  ]),
};

export default CustomFormatting;
