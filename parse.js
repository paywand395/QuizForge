'use strict';

/**
 * Parse a QuizForge markdown file into a quiz object.
 *
 * Format:
 *   # Quiz title
 *   description: optional one-line description
 *   dir: rtl            (optional: rtl | ltr, default: auto-detect)
 *   lang: ckb           (optional language tag)
 *
 *   ## Question text
 *   - [x] Correct answer
 *   - [ ] Wrong answer
 *   - [ ] Wrong answer
 *   > Optional explanation shown after answering
 *
 * Exactly one [x] per question.
 */
function parse(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const quiz = { title: 'Quiz', description: '', dir: 'auto', lang: '', questions: [] };
  let current = null;
  let sawTitle = false;

  const finish = () => {
    if (!current) return;
    quiz.questions.push(current);
    current = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const n = i + 1;
    if (!line) return;

    if (/^#\s+/.test(line) && !/^##/.test(line)) {
      if (!sawTitle) {
        quiz.title = line.replace(/^#\s+/, '');
        sawTitle = true;
      }
      return;
    }
    if (/^##\s+/.test(line)) {
      finish();
      current = { question: line.replace(/^##\s+/, ''), options: [], answer: -1, explanation: '', line: n };
      return;
    }
    const meta = line.match(/^(description|dir|lang):\s*(.*)$/i);
    if (meta && !current) {
      quiz[meta[1].toLowerCase()] = meta[2].trim();
      return;
    }
    const opt = line.match(/^[-*]\s*\[( |x|X)\]\s*(.+)$/);
    if (opt) {
      if (!current) throw new Error(`Line ${n}: answer option found before any "## question"`);
      current.options.push(opt[2].trim());
      if (opt[1].toLowerCase() === 'x') {
        if (current.answer !== -1) throw new Error(`Line ${n}: question "${current.question}" has more than one [x]`);
        current.answer = current.options.length - 1;
      }
      return;
    }
    if (/^>\s?/.test(line)) {
      if (!current) throw new Error(`Line ${n}: explanation found before any "## question"`);
      current.explanation += (current.explanation ? ' ' : '') + line.replace(/^>\s?/, '');
      return;
    }
    throw new Error(`Line ${n}: could not understand "${line.slice(0, 50)}"`);
  });
  finish();

  quiz.questions.forEach((q) => {
    if (q.options.length < 2) throw new Error(`Line ${q.line}: "${q.question}" needs at least 2 options`);
    if (q.answer === -1) throw new Error(`Line ${q.line}: "${q.question}" has no correct option marked [x]`);
  });
  if (!quiz.questions.length) throw new Error('No questions found. Start each question with "## ".');

  if (quiz.dir === 'auto' || !['rtl', 'ltr'].includes(quiz.dir)) {
    const sample = quiz.title + quiz.questions.map((q) => q.question).join(' ');
    const rtl = (sample.match(/[֐-ࣿﭐ-﻿]/g) || []).length;
    const latin = (sample.match(/[A-Za-z]/g) || []).length;
    quiz.dir = rtl > latin ? 'rtl' : 'ltr';
  }
  return quiz;
}

module.exports = { parse };
