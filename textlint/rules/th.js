import { createTextlintRule, readForbiddenTerms } from "../rule-factory.js";

const ruleDefinitions = [
  {
    name: "forbidden term",
    regexp: new RegExp(readForbiddenTerms("thai.txt").join("|")),
  },
  {
    name: "invalid (ดู spacing",
    regexp: /\(ดู\S/,
  },
  {
    name: "obsolete character",
    regexp: /[◌ฺฃฅ]/,
  },
  {
    name: "space around ellipsis",
    regexp: /(?:[^’’”][ \t]+…|…[ \t]+[^’’”])/,
  },
];

export default createTextlintRule(ruleDefinitions);
