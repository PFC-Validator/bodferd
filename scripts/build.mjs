import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usedIds = new Set();
function inline(s) {
  const tokens = [];
  const token = value => { tokens.push(value); return `@@TOKEN${tokens.length - 1}@@`; };
  s = s.replace(/`([^`]+)`/g, (_, code) => token(`<code>${escape(code)}</code>`));
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const target = href === 'security-review.md' ? '#security-review' : href === 'design.md' ? '#protocol-reference' : href;
    if (!/^(https?:\/\/|#)/.test(target)) return escape(label);
    return token(`<a href="${escape(target)}"${target.startsWith('http') ? ' rel="noreferrer"' : ''}>${inline(label)}</a>`);
  });
  s = escape(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s.replace(/@@TOKEN(\d+)@@/g, (_, i) => tokens[Number(i)]);
}
function renderMarkdown(source, prefix) {
  const lines = source.split('\n'), result = [], headings = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const code = []; const lang = line.slice(3).trim(); i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      if (i === lines.length) throw new Error('Unclosed Markdown code fence');
      i++; result.push(`<pre tabindex="0" aria-label="${escape(lang || 'Text')} example"><code>${escape(code.join('\n'))}</code></pre>`); continue;
    }
    const h = /^(#{1,6}) (.+)$/.exec(line);
    if (h) {
      if (h[1].length === 1) { i++; continue; }
      const level = Math.min(6, h[1].length + 1), base = `${prefix}-${slug(h[2])}`;
      let id = base, count = 2; while (usedIds.has(id)) id = `${base}-${count++}`;
      usedIds.add(id); headings.push({ id, title: h[2], level });
      result.push(`<h${level} id="${id}">${inline(h[2])}<a class="heading-link" href="#${id}" aria-label="Link to ${escape(h[2])}">#</a></h${level}>`); i++; continue;
    }
    if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i + 1] || '')) {
      const cells = s => s.trim().slice(1, -1).split('|').map(c => inline(c.trim()));
      const head = cells(line); i += 2; const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]));
      result.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="Reference table"><table><thead><tr>${head.map(c => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    const list = /^(?:- |\d+\. )/.exec(line);
    if (list) {
      const ordered = /^\d/.test(line), tag = ordered ? 'ol' : 'ul', items = [];
      while (i < lines.length && (ordered ? /^\d+\. / : /^- /).test(lines[i])) items.push(inline(lines[i++].replace(/^(?:- |\d+\. )/, '')));
      result.push(`<${tag}>${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`); continue;
    }
    const para = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#|```|\||- |\d+\. )/.test(lines[i])) para.push(lines[i++]);
    result.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return { html: result.join('\n'), headings };
}
const protocol = renderMarkdown(read('docs/design.md'), 'protocol');
const review = renderMarkdown(read('docs/security-review.md'), 'review');
const overview = read('src/overview.html');
const protocolToc = protocol.headings.filter(h => h.level === 3).map(h => `<li><a href="#${h.id}">${escape(h.title)}</a></li>`).join('');
const html = read('src/shell.html').replace('@@OVERVIEW@@', overview).replace('@@PROTOCOL@@', protocol.html).replace('@@PROTOCOL_TOC@@', protocolToc).replace('@@REVIEW@@', review.html);
if (/@@[A-Z_]+@@/.test(html)) throw new Error('Unresolved template marker');
mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/index.html'), html);
for (const file of ['styles.css', 'read.js']) copyFileSync(resolve(root, `src/${file}`), resolve(root, `dist/${file}`));
for (const [from, to] of [['docs/design.md', 'design.md'], ['docs/security-review.md', 'security-review.md']]) copyFileSync(resolve(root, from), resolve(root, `dist/${to}`));
console.log(`Built reading edition: ${protocol.headings.length} protocol headings, ${review.headings.length} review headings.`);
