import {readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMarkdown, escape, fillTemplate, designDate} from './markdown.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
const source = read('docs/design.md'), usedIds = new Set();
const protocol = renderMarkdown(source, 'protocol', {usedIds});
const review = renderMarkdown(read('docs/security-review.md'), 'review', {usedIds});
const external = renderMarkdown(read('adversarial.md'), 'external', {usedIds});
const overview = read('src/overview.html').replace(/<!-- Z>>>.*?<<<Z -->/gs, '');
const protocolToc = protocol.headings.filter(h => h.level === 3).map(h => `<li><a href="#${h.id}">${escape(h.title)}</a></li>`).join('');
const html = fillTemplate(read('src/shell.html'), {
  OVERVIEW:overview, PROTOCOL:protocol.html, PROTOCOL_TOC:protocolToc,
  REVIEW:review.html, EXTERNAL_REVIEW:external.html, UPDATED_DATE:escape(designDate(source)),
});
mkdirSync(resolve(root, 'dist'), {recursive:true});
writeFileSync(resolve(root, 'dist/index.html'), html);
for (const file of ['styles.css', 'read.js']) copyFileSync(resolve(root, `src/${file}`), resolve(root, `dist/${file}`));
for (const [from, to] of [['docs/design.md', 'design.md'], ['docs/security-review.md', 'security-review.md'], ['adversarial.md', 'adversarial.md'], ['docs/review-decisions.md', 'review-decisions.md']]) copyFileSync(resolve(root, from), resolve(root, `dist/${to}`));
cpSync(resolve(root, 'src/brand'), resolve(root, 'dist/brand'), {recursive:true});
console.log(`Built reading edition: ${protocol.headings.length} protocol, ${review.headings.length} original review, ${external.headings.length} external review headings.`);
