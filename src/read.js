const nav = document.querySelector('nav');
const sidebar = document.querySelector('.sidebar');
const box = document.createElement('div');
box.className = 'search-box';
const label = document.createElement('label'); label.htmlFor = 'document-search'; label.textContent = 'Find in document';
const input = document.createElement('input'); input.id = 'document-search'; input.type = 'search'; input.placeholder = 'Search keys, replay, Tor…'; input.autocomplete = 'off';
const status = document.createElement('p'); status.className = 'search-status'; status.setAttribute('role', 'status');
const results = document.createElement('ul'); results.className = 'search-results';
box.append(label, input, status, results); sidebar.prepend(box);
const index = [...document.querySelectorAll('main h2, main h3, main h4')].filter(h => h.id || h.closest('section')?.id).map(h => {
  let next = h.nextElementSibling, text = h.textContent;
  while (next && !/^H[2-4]$/.test(next.tagName)) { text += ' ' + next.textContent; next = next.nextElementSibling; }
  return {title:h.textContent.replace(/#$/, '').trim(), id:h.id || h.closest('section').id, text:text.toLowerCase()};
});
input.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase(); results.replaceChildren();
  if (query.length < 2) { status.textContent = query ? 'Enter at least two characters.' : ''; return; }
  const matches = index.filter(x => x.text.includes(query));
  status.textContent = matches.length ? `${matches.length} matching section${matches.length === 1 ? '' : 's'}.` : 'No matching sections. Try a different term.';
  for (const item of matches.slice(0, 12)) { const li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + item.id; a.textContent = item.title; li.append(a); results.append(li); }
  if (matches.length > 12) status.textContent += ' Showing the first 12.';
});
const links = [...nav.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll('main>section')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
  if (!visible) return;
  for (const a of links) { const active = a.hash === '#' + visible.target.id; a.classList.toggle('current', active); if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }
}, {rootMargin:'-90px 0px -65% 0px', threshold:0});
for (const section of sections) observer.observe(section);
const contents = document.querySelector('.contents');
if (window.matchMedia('(max-width:760px)').matches) contents.open = false;
nav.addEventListener('click', e => {if(e.target.closest('a') && window.matchMedia('(max-width:760px)').matches) contents.open = false;});
const print = document.getElementById('print-document'); print.hidden = false; print.addEventListener('click', () => window.print());
