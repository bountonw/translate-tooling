import { createTextlintRule } from "../rule-factory.js";

const ruleDefinitions = [
  {
    name: "no trailing space after 'ๆ' mai yamok",
    regexp: /ๆ[^\s…!’”\)\]\[]/,
  },
];

export default createTextlintRule(ruleDefinitions);
