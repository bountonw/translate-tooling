import { applyCustomFormattingRules } from "./helpers.js";

const customFormattingRules = [
  {
    name: "closing parenthesis not properly followed",
    regexp: /\)[^ ’”;:,.!<\[]/,
  },
];

const CustomFormatting = {
  names: ["custom-formatting-edit"],
  description: "Custom formatting rules",
  tags: ["style"],
  function: applyCustomFormattingRules(customFormattingRules),
};

export default CustomFormatting;
