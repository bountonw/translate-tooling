import { applyCustomFormattingRules } from "./helpers.js";

const customFormattingRules = [
  {
    name: "no trailing space after 'ๆ' mai yamok",
    regexp: /ๆ[^\s…!’”\)\]\[]/,
  },
];

const CustomFormatting = {
  names: ["custom-formatting-edit-th"],
  description: "Custom formatting (th) rules",
  tags: ["style"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
