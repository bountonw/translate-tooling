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
];

const CustomFormatting = {
  names: ["custom-formatting-lo"],
  description: "Custom formatting (lo) rules",
  tags: ["style"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
