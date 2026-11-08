import assert from 'node:assert/strict';
import test from 'node:test';
import { extractLatexDocument } from '../src/utils/latex.js';

const validLatex = String.raw`\documentclass{article}
\usepackage[margin=1in]{geometry}
\begin{document}
Resume content
\end{document}`;

test('accepts a complete LaTeX document with surrounding whitespace', () => {
  assert.equal(extractLatexDocument(` \r\n${validLatex}\r\n `), validLatex);
});

test('extracts LaTeX from Markdown code fences', () => {
  const wrapped = `Here is the resume:\n\`\`\`latex\n${validLatex}\n\`\`\`\nGenerated resume.`;
  assert.equal(extractLatexDocument(wrapped), validLatex);
});

test('ignores leading and trailing explanations', () => {
  const explained = `Here is your resume.\n\n${validLatex}\n\nI hope this helps.`;
  assert.equal(extractLatexDocument(explained), validLatex);
});

test('rejects output that is not LaTeX', () => {
  assert.equal(extractLatexDocument('This is a resume, not LaTeX.'), null);
});

test('rejects documents missing either document marker', () => {
  assert.equal(
    extractLatexDocument(String.raw`\documentclass{article}\begin{document}Resume`),
    null
  );
  assert.equal(
    extractLatexDocument(String.raw`\documentclass{article}Resume\end{document}`),
    null
  );
});

test('rejects duplicate opening document markers', () => {
  assert.equal(
    extractLatexDocument(validLatex.replace('\\begin{document}', '\\begin{document}\\begin{document}')),
    null
  );
});

test('drops trailing text after the matching document end marker', () => {
  assert.equal(
    extractLatexDocument(`${validLatex}\n\\end{document}\nExplanation`),
    validLatex
  );
});
