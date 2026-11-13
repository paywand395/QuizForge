# QuizForge

Turn a simple text file into an interactive quiz web page that works offline,
on any phone, with no internet and no server.

Built for students, especially Kurdish Sorani and Arabic speakers. Right-to-left
text is detected automatically, and the buttons are translated.

- One small file in, one HTML file out
- Works offline: open it in any browser, or send it on Telegram
- Kurdish Sorani, Arabic and English interface
- Instant feedback, explanations, score and a review of mistakes
- Shuffles questions and answers each attempt
- Light and dark mode
- Zero dependencies

## Quick start

Requires [Node.js](https://nodejs.org) 16 or newer.

```bash
git clone https://github.com/<your-username>/quizforge.git
cd quizforge
node bin/quizforge.js examples/sample-en.md
```

This creates `examples/sample-en.html`. Open it in a browser.

## Writing questions

```markdown
# My Lecture Quiz
description: Chapter 3 review
lang: ckb

## Which factor is missing in Hemophilia B?
- [ ] Factor VIII
- [x] Factor IX
- [ ] Factor XI
> Hemophilia B is a deficiency of factor IX.
```

| Line | Meaning |
|------|---------|
| `# Title` | Quiz title |
| `description:` | Optional subtitle |
| `lang:` | `en`, `ckb` (Kurdish Sorani) or `ar` (Arabic). Sets the interface language |
| `dir:` | Optional `rtl` or `ltr`. Detected automatically if left out |
| `## ...` | A new question |
| `- [x] ...` | The correct answer (exactly one) |
| `- [ ] ...` | A wrong answer |
| `> ...` | Optional explanation shown after answering |

## Options

```
quizforge <questions.md> [-o quiz.html] [--no-shuffle]
```

## Tests

```bash
npm test
```

## Contributing

Issues and pull requests are welcome, especially new interface languages
(Kurmanji, Persian, Turkish) and accessibility improvements.

## License

MIT, see [LICENSE](LICENSE).
