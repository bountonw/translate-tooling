import { applyCustomFormattingRules } from "./helpers.js";

const customFormattingRules = [
  {
    name: "legacy AM vowel (ໍາ should be ຳ)",
    test: (line) => {
      if (!line) return -1;
      
      // Pattern to match Lao consonant + SARA AM (ໍ) + SARA AA (າ)
      // This is the legacy form that should be converted to standard form
      // Unicode ranges: Lao consonants (\u0E81-\u0EAE), SARA AM (\u0ECD), SARA AA (\u0EB2)
      const legacyAmPattern = /([\u0E81-\u0EAE])\u0ECD\u0EB2/;
      const match = line.match(legacyAmPattern);
      
      if (match) {
        return line.indexOf(match[0]);
      }
      
      return -1;
    },
  },
];

const CustomFormatting = {
  names: ["custom-formatting-lao-am-vowel"],
  description: "Lao AM vowel Unicode consistency rule",
  tags: ["style", "unicode"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
