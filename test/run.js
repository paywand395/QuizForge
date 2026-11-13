'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parse } = require('../src/parse');
const { render } = require('../src/template');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('ok -', name);
}

test('parses title, options and answer', () => {
  const q = parse('# T\n## Q1?\n- [ ] a\n- [x] b\n> because');
  assert.strictEqual(q.title, 'T');
  assert.strictEqual(q.questions.length, 1);
  assert.strictEqual(q.questions[0].answer, 1);
  assert.strictEqual(q.questions[0].explanation, 'because');
  assert.strictEqual(q.dir, 'ltr');
});

test('detects right-to-left text', () => {
  const q = parse('# تاقیکردنەوە\n## پرسیار؟\n- [x] بەڵێ\n- [ ] نەخێر');
  assert.strictEqual(q.dir, 'rtl');
});

test('rejects question without a correct answer', () => {
  assert.throws(() => parse('## Q?\n- [ ] a\n- [ ] b'), /no correct option/);
});

test('rejects two correct answers', () => {
  assert.throws(() => parse('## Q?\n- [x] a\n- [x] b'), /more than one/);
});

test('rejects empty file', () => {
  assert.throws(() => parse('# Only a title'), /No questions/);
});

test('escapes HTML in the output', () => {
  const html = render(parse('# <b>x</b>\n## </script><script>alert(1)</script>?\n- [x] a\n- [ ] b'));
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'));
  assert.ok(!html.includes('</script><script>alert(1)'));
});

test('example files build', () => {
  const dir = path.join(__dirname, '..', 'examples');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const html = render(parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    assert.ok(html.startsWith('<!DOCTYPE html>'), f);
  }
});

console.log(`\n${passed} tests passed`);
