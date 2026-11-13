#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('../src/parse');
const { render } = require('../src/template');

const HELP = `quizforge - turn a simple text file into an interactive quiz web page

Usage:
  quizforge <questions.md> [-o quiz.html] [--no-shuffle]

Options:
  -o, --out <file>   Output file (default: same name with .html)
  --no-shuffle       Keep questions and answers in the written order
  -h, --help         Show this help
`;

function main(argv) {
  const args = argv.slice(2);
  if (!args.length || args.includes('-h') || args.includes('--help')) {
    process.stdout.write(HELP);
    return 0;
  }
  let input = null;
  let out = null;
  let shuffle = true;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-o' || a === '--out') out = args[++i];
    else if (a === '--no-shuffle') shuffle = false;
    else if (!input) input = a;
    else {
      process.stderr.write(`Unknown argument: ${a}\n`);
      return 1;
    }
  }
  if (!input) {
    process.stderr.write('Please give a questions file.\n');
    return 1;
  }
  try {
    const quiz = parse(fs.readFileSync(input, 'utf8'));
    const target = out || input.replace(/\.[^.]*$/, '') + '.html';
    fs.writeFileSync(target, render(quiz, { shuffle }));
    process.stdout.write(`Wrote ${target} (${quiz.questions.length} questions, ${quiz.dir})\n`);
    return 0;
  } catch (e) {
    process.stderr.write(`Error: ${e.message}\n`);
    return 1;
  }
}

process.exitCode = main(process.argv);

