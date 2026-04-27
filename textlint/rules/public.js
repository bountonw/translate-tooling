import { createTextlintRule } from "../rule-factory.js";

const ruleDefinitions = [
  {
    name: "closing parenthesis not properly followed",
    regexp: /\)[^ ’”;:,.!<…\[]/,
  },
];

export default createTextlintRule(ruleDefinitions);
