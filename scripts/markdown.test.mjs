import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {inline, renderMarkdown, fillTemplate, designDate} from './markdown.mjs';

test('table pipes in code and escapes remain in one cell', () => {
  const {html} = renderMarkdown('| Expression | Result |\n|---|---|\n| `a|b` and x\\|y | yes |', 't');
  assert.equal((html.match(/<td>/g) || []).length, 2);
  assert.ok(html.includes('<code>a|b</code> and x|y'));
});
test('ordered paragraph continuation and loose flat lists preserve structure', () => {
  assert.equal(renderMarkdown('Released in\n2026. Still a paragraph.', 't').html, '<p>Released in 2026. Still a paragraph.</p>');
  const {html} = renderMarkdown('- first\n\n- second', 't');
  assert.equal((html.match(/<ul>/g) || []).length, 1);
  assert.equal((html.match(/<li>/g) || []).length, 2);
});
test('literal template-looking document text stays literal', () => {
  const fragment = renderMarkdown('Literal @@FOO@@ and `@@TOKEN0@@`.', 't').html;
  assert.ok(fillTemplate('@@BODY@@', {BODY:fragment}).includes('@@FOO@@'));
  assert.ok(fragment.includes('<code>@@TOKEN0@@</code>'));
  assert.throws(() => fillTemplate('@@MISSING@@', {}), /Unresolved shell/);
});
test('balanced links preserve parentheses; dropped or unsafe targets warn', () => {
  assert.ok(inline('[spec](https://example.org/a_(b))').includes('href="https://example.org/a_(b)"'));
  const warnings = [];
  assert.equal(inline('[missing](future.md)', s => warnings.push(s)), 'missing');
  assert.equal(inline('[unsafe](javascript:alert(1))', s => warnings.push(s)), 'unsafe');
  assert.equal(warnings.length, 2);
  assert.ok(inline('[x](https://example.org/?a="x")').includes('&quot;'));
});
test('dates follow authoritative header and reject impossible dates', () => {
  assert.equal(designDate('Status: draft. Updated 2027-01-03.'), '3 January 2027');
  assert.throws(() => designDate('Updated 2027-02-31'), /Invalid/);
});
test('review annotations are hidden in reading edition, ordinary text is not', () => {
  const {html} = renderMarkdown('Visible.\n\nZ>>> A01: note. <<<Z\n\nStill visible.', 't');
  assert.ok(!html.includes('note.'));
  assert.ok(html.includes('Still visible.'));
});
test('optional page enhancements tolerate absent surfaces and observers', () => {
  const source = readFileSync(new URL('../src/read.js', import.meta.url), 'utf8');
  runInNewContext(source, {document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},window:{}});
});
