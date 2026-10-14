// Check tracked generated files against an isolated fresh source build.
import {mkdtempSync, cpSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fresh = mkdtempSync(join(tmpdir(), 'bodferd-build-'));
const files = dir => readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(join(dir,e.name)).map(p => join(e.name,p)) : [e.name]).sort();
try {
  for (const path of ['docs','src','scripts','adversarial.md']) cpSync(join(root,path),join(fresh,path),{recursive:true});
  execFileSync(process.execPath,[join(fresh,'scripts/build.mjs')],{stdio:'inherit'});
  const expected = files(join(fresh,'dist')), actual = files(join(root,'dist'));
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Generated file inventory differs');
  for (const path of expected) if (!readFileSync(join(fresh,'dist',path)).equals(readFileSync(join(root,'dist',path)))) throw new Error(`Stale generated file: ${path}`);
  console.log(`Generated output matches an isolated rebuild (${expected.length} files).`);
} finally { rmSync(fresh,{recursive:true,force:true}); }
