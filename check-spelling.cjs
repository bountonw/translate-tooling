#!/usr/bin/env node

const fs = require("fs");

const words = fs.readFileSync("./words.txt", "utf-8");

const cleanString = words.replace(/[^\u0E00-\u0E7F]/g, "\n");
// .replace(/\s+/g, " ");

var Spellchecker = require("hunspell-spellchecker");

var spellchecker = new Spellchecker();

var DICT = spellchecker.parse({
  aff: fs.readFileSync("./th_TH.aff"),
  dic:
    fs.readFileSync("./latex/dictionaries/forbidden-breaks", "utf-8") +
    "\n" +
    fs.readFileSync("./custom.txt", "utf-8") +
    "\n" +
    fs.readFileSync("./th_TH.dic", "utf-8"),
});

const onlyUnique = (value, index, array) => {
  return array.indexOf(value) === index;
};

console.log(spellchecker.check("พระคัมภีร์"));

const cleanWords = cleanString
  .split("\n")
  .filter(onlyUnique)
  .filter((w) => w !== "ณ");

// spellchecker.use(DICT);
const incorrectWords = [];
for (const word of cleanWords) {
  if (!spellchecker.check(word) && !spellchecker.check(word.replace("ๆ", ""))) {
    incorrectWords.push(word);
  }
}

console.log(incorrectWords, incorrectWords.filter(onlyUnique).length);
