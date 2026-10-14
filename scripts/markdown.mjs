// Deliberately small reading-edition subset: headings, fences, flat lists,
// tables, inline code/emphasis and links. Unsupported relative links warn.
export const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const localLinks = new Map([
  ['security-review.md', '#security-review'], ['design.md', '#protocol-reference'],
  ['../adversarial.md', '#external-review'], ['adversarial.md', '#external-review'],
  ['review-decisions.md', 'review-decisions.md'],
]);
export function inline(source, warn = console.warn) {
  let out = '';
  for (let i = 0; i < source.length;) {
    if (source[i] === '\\' && /[\\`*\[\]()|]/.test(source[i + 1] || '')) { out += escape(source[i + 1]); i += 2; continue; }
    if (source[i] === '`') {
      const delimiter = /^`+/.exec(source.slice(i))[0], end = source.indexOf(delimiter, i + delimiter.length);
      if (end !== -1) { out += `<code>${escape(source.slice(i + delimiter.length, end))}</code>`; i = end + delimiter.length; continue; }
    }
    if (source[i] === '[') {
      const labelEnd = source.indexOf('](', i + 1);
      if (labelEnd !== -1) {
        let end = labelEnd + 2, depth = 1;
        for (; end < source.length; end++) {
          if (source[end] === '\\') { end++; continue; }
          if (source[end] === '(') depth++;
          if (source[end] === ')' && --depth === 0) break;
        }
        if (depth === 0) {
          const label = source.slice(i + 1, labelEnd), href = source.slice(labelEnd + 2, end);
          const target = localLinks.get(href) || href;
          if (/^(https?:\/\/|#)/.test(target) || localLinks.has(href)) {
            out += `<a href="${escape(target)}"${target.startsWith('http') ? ' rel="noreferrer"' : ''}>${inline(label, warn)}</a>`;
          } else { warn(`Unsupported link target: ${href}`); out += inline(label, warn); }
          i = end + 1; continue;
        }
      }
    }
    if (source[i] === '*') {
      const delimiter = source.startsWith('**', i) ? '**' : '*';
      const end = source.indexOf(delimiter, i + delimiter.length);
      if (end > i + delimiter.length && !/\s/.test(source[i + delimiter.length]) && !/\s/.test(source[end - 1])) {
        const tag = delimiter.length === 2 ? 'strong' : 'em';
        out += `<${tag}>${inline(source.slice(i + delimiter.length, end), warn)}</${tag}>`; i = end + delimiter.length; continue;
      }
    }
    out += escape(source[i++]);
  }
  return out;
}
function cells(line) {
  const source = line.trim().replace(/^\|/, '').replace(/\|$/, ''), result = [];
  let start = 0, ticks = '';
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\\') { i++; continue; }
    if (source[i] === '`') {
      const delimiter = /^`+/.exec(source.slice(i))[0];
      if (!ticks) ticks = delimiter; else if (ticks === delimiter) ticks = '';
      i += delimiter.length - 1;
    } else if (source[i] === '|' && !ticks) { result.push(source.slice(start, i).trim()); start = i + 1; }
  }
  result.push(source.slice(start).trim()); return result;
}
export function renderMarkdown(source, prefix, {usedIds = new Set(), warn = console.warn} = {}) {
  // Review annotations remain in source/downloads; the reading edition renders
  // the actual draft and a separate complete external findings/disposition section.
  const lines = source.replace(/^Z>>>.*?<<<Z\s*$/gms, '').split('\n');
  const result = [], headings = [];
  const listItem = line => /^(?:- |\d{1,9}\. )/.test(line);
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const code = [], lang = line.slice(3).trim(); i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      if (i === lines.length) throw new Error('Unclosed Markdown code fence');
      i++; result.push(`<pre tabindex="0" aria-label="${escape(lang || 'Text')} example"><code>${escape(code.join('\n'))}</code></pre>`); continue;
    }
    const h = /^(#{1,6}) (.+)$/.exec(line);
    if (h) {
      if (h[1].length === 1) { i++; continue; }
      const level = Math.min(6, h[1].length + 1), base = `${prefix}-${slug(h[2])}`;
      let id = base, count = 2; while (usedIds.has(id)) id = `${base}-${count++}`;
      usedIds.add(id); headings.push({id, title: h[2], level});
      result.push(`<h${level} id="${id}">${inline(h[2], warn)}<a class="heading-link" href="#${id}" aria-label="Link to ${escape(h[2])}">#</a></h${level}>`); i++; continue;
    }
    if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i + 1] || '')) {
      const head = cells(line), rows = []; i += 2;
      while (i < lines.length && lines[i].startsWith('|')) {
        const row = cells(lines[i++]); if (row.length !== head.length) throw new Error('Markdown table column count differs from header'); rows.push(row);
      }
      const render = c => inline(c, warn);
      result.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="Reference table"><table><thead><tr>${head.map(c => `<th scope="col">${render(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${render(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    if (listItem(line)) {
      const ordered = /^\d/.test(line), tag = ordered ? 'ol' : 'ul', items = [];
      const matches = l => (ordered ? /^\d{1,9}\. / : /^- /).test(l);
      const firstNumber = ordered ? Number(line.split('.')[0]) : 1;
      while (i < lines.length) {
        if (matches(lines[i])) { items.push(inline(lines[i++].replace(/^(?:- |\d{1,9}\. )/, ''), warn)); continue; }
        if (!lines[i].trim()) {
          let next = i; while (next < lines.length && !lines[next].trim()) next++;
          if (matches(lines[next] || '')) { i = next; continue; }
        }
        break;
      }
      result.push(`<${tag}${ordered && firstNumber !== 1 ? ` start="${firstNumber}"` : ''}>${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`); continue;
    }
    const para = [line]; i++;
    // An ordered list can interrupt a paragraph only when it starts at 1.
    while (i < lines.length && lines[i].trim() && !/^(#|```|\||- |1\. )/.test(lines[i])) para.push(lines[i++]);
    result.push(`<p>${inline(para.join(' '), warn)}</p>`);
  }
  return {html: result.join('\n'), headings};
}
export function fillTemplate(shell, fragments) {
  // Inspect placeholders in the shell only: document literals are not templates.
  return shell.replace(/@@([A-Z_]+)@@/g, (marker, key) => {
    if (!Object.hasOwn(fragments, key)) throw new Error(`Unresolved shell template marker: ${marker}`);
    return fragments[key];
  });
}
export function designDate(source) {
  const match = /\bUpdated (\d{4}-\d{2}-\d{2})\b/.exec(source);
  if (!match) throw new Error('Design header must supply an Updated YYYY-MM-DD date');
  const date = new Date(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== match[1]) throw new Error('Invalid design update date');
  return new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
}
