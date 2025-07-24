import { applyCustomFormattingRules, readForbiddenTerms } from "./helpers.js";

const customFormattingRules = [
  {
    name: "forbidden term",
    regexp: new RegExp(`${readForbiddenTerms("lao.txt").join("|")}`),
  },
  {
    name: "forbidden ຫນ",
    regexp: /(?<!ຫວງແ)ຫນ/,
  },
  {
    name: "forbidden ຫມ",
    regexp: /(?<!ເນເ)(?<!ໂ)ຫມ(?!ຢາ)/,
  },
  {
    name: "forbidden ທີ່ສອງ",
    regexp: /ທີ່ສອງ(?!ຝ່າຍ)/,
  },
  {
    name: "forbidden ທີ່ສາມ",
    regexp: /ທີ່ສາມ(?!າດ)(?!ັນ)/,
  },
  {
    name: "forbidden ທີ່ສີ",
    regexp: /ທີ່ສີ(?!່ແຍກ)/,
  },
  {
    name: "forbidden ທີ່ຫ້າ",
    regexp: /ທີ່ຫ້າ(?!ມ)(?!ວຫັນ)/,
  },
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
  {
    name: "missing space after punctuation",
    regexp: /[,!?][\u0E80-\u0EFF]/,
  },
  {
    name: "missing space after period",
    regexp: /(?<![\s\(][ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮ])\.[\u0E80-\u0EFF]/,
  },
];

const CustomFormatting = {
  names: ["custom-formatting-lo"],
  description: "Custom formatting (lo) rules",
  tags: ["style"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
