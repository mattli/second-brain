// Deterministic verifier for the Voice Tutor landing page.
// FIXED FILE — the generator must not modify this. It grades index.html only.
// Tooling lives OUTSIDE the repo (a git worktree contains tracked files only):
//   ~/.node-tools/playwright      (+ Chromium in ~/Library/Caches/ms-playwright)
//   ~/.node-tools/html-validate
// Hermetic: Chromium loads a file:// URL. No network request is made by this script.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from '/Users/mattli/.node-tools/playwright/node_modules/playwright/index.mjs';

const HTML_VALIDATE = '/Users/mattli/.node-tools/html-validate/node_modules/.bin/html-validate';
const SUPABASE_URL = 'https://vxslotmvmuwxlixutvbi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kAeVtbJztjtIMdPxyOKIiw_SjemghWX';
const FILE = resolve('index.html');

const fails = [];
const ok = [];
const check = (name, cond, detail = '') => {
  if (cond) ok.push(name);
  else fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

if (!existsSync(FILE)) {
  console.error('FATAL: index.html does not exist at repo root.');
  process.exit(1);
}
const src = readFileSync(FILE, 'utf8');
const count = (s, sub) => s.split(sub).length - 1;

// --- 1. Valid HTML5 -------------------------------------------------------
let hvOut = '';
let hvPass = false;
try {
  execFileSync(HTML_VALIDATE, ['--formatter', 'stylish', FILE], { encoding: 'utf8', stdio: 'pipe' });
  hvPass = true;
} catch (e) {
  if (e.code === 'ENOENT') {
    console.error('FATAL (environmental): html-validate not found at ' + HTML_VALIDATE);
    process.exit(2);
  }
  hvOut = (e.stdout || '') + (e.stderr || '');
}
check('1. valid HTML5 (html-validate)', hvPass, hvOut.trim().split('\n').slice(0, 12).join(' | '));

// --- 2. Exactly one outbound request target, and it is Supabase -----------
const urls = [...src.matchAll(/https?:\/\/[^\s"'`)<>]+/g)].map(m => m[0]);
const outbound = [...new Set(urls.map(u => u.replace(/[.,;]+$/, '')))];
const nonSupabase = outbound.filter(u => !u.startsWith(SUPABASE_URL));
check('2a. only outbound host is Supabase', nonSupabase.length === 0, `found: ${nonSupabase.join(', ')}`);
check('2b. no <link href="http', !/<link[^>]+href\s*=\s*["']https?:/i.test(src));
check('2c. no <script src="http', !/<script[^>]+src\s*=\s*["']https?:/i.test(src));
check('2d. no @import', !/@import/i.test(src));
check('2e. no url(http', !/url\(\s*['"]?https?:/i.test(src));

// --- 3. URL and key each appear exactly once, as named constants ----------
check('3a. SUPABASE_URL literal appears exactly once', count(src, SUPABASE_URL) === 1, `count=${count(src, SUPABASE_URL)}`);
check('3b. SUPABASE_KEY literal appears exactly once', count(src, SUPABASE_KEY) === 1, `count=${count(src, SUPABASE_KEY)}`);
check('3c. URL bound to a named const', new RegExp(`const\\s+SUPABASE_URL\\s*=\\s*['"\`]${SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`).test(src));
check('3d. key bound to a named const', new RegExp(`const\\s+SUPABASE_KEY\\s*=\\s*['"\`]${SUPABASE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`).test(src));

// --- 4. service_role appears nowhere -------------------------------------
check('4. no "service_role" anywhere', !/service_role/i.test(src));

// --- 5. No Tailscale / token strings -------------------------------------
for (const lit of ['taild1f9b7', 'ts.net', '?u=']) {
  check(`5. no occurrence of "${lit}"`, !src.includes(lit));
}

// --- 6. Every input has an associated <label> ----------------------------
const labelFors = new Set([...src.matchAll(/<label[^>]+for\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]));
const fields = [...src.matchAll(/<(input|textarea|select)\b([^>]*)>/gi)]
  .filter(m => !/type\s*=\s*["'](submit|button|hidden)["']/i.test(m[2]));
for (const f of fields) {
  const id = (f[2].match(/\bid\s*=\s*["']([^"']+)["']/i) || [])[1];
  check(`6. <${f[1]}> id="${id || '(none)'}" has a <label for=…>`, !!id && labelFors.has(id));
}
check('6. at least two form fields present', fields.length >= 2, `found ${fields.length}`);

// --- 8. Under 50KB --------------------------------------------------------
const bytes = Buffer.byteLength(src, 'utf8');
check('8. under 50KB', bytes < 50 * 1024, `${(bytes / 1024).toFixed(1)}KB`);

// --- 9. Six sections, with ids, in document order ------------------------
const EXPECTED = ['hero', 'how-it-works', 'different', 'who', 'disclosure', 'signup'];
const sectionIds = [...src.matchAll(/<section[^>]*\bid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
check('9. six <section> ids in document order', JSON.stringify(sectionIds) === JSON.stringify(EXPECTED), `found: [${sectionIds.join(', ')}]`);

// --- 10. Submit disables before request, re-enables on failure -----------
const scriptBody = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
const iDisableTrue = scriptBody.search(/\.disabled\s*=\s*(!0|true)/);
const iFetch = scriptBody.search(/\bfetch\s*\(/);
const iDisableFalse = scriptBody.search(/\.disabled\s*=\s*(!1|false)/);
check('10a. button disabled before fetch', iDisableTrue !== -1 && iFetch !== -1 && iDisableTrue < iFetch,
  `disabled=true@${iDisableTrue} fetch@${iFetch}`);
check('10b. button re-enabled after fetch (failure path)', iDisableFalse !== -1 && iDisableFalse > iFetch,
  `disabled=false@${iDisableFalse}`);
check('10c. a catch/error path exists', /catch\s*[({]/.test(scriptBody));
check('10d. mailto: fallback present', /mailto:/i.test(src));

// --- 7. Real browser: overflow at 3 viewports + no console errors --------
check('7z. viewport meta present', /<meta[^>]+name\s*=\s*["']viewport["']/i.test(src));
let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.error('FATAL (environmental): Chromium failed to launch — ' + e.message);
  process.exit(2);
}
for (const width of [375, 768, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { if (!r.url().startsWith('file://')) errors.push('NETWORK REQUEST: ' + r.url()); });
  await page.goto('file://' + FILE, { waitUntil: 'load' });
  const m = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  check(`7. no horizontal overflow at ${width}px`, m.sw <= m.cw, `scrollWidth=${m.sw} clientWidth=${m.cw}`);
  check(`7. no console errors at ${width}px`, errors.length === 0, errors.slice(0, 5).join(' | '));
  await ctx.close();
}
await browser.close();

// --- report ---------------------------------------------------------------
console.log(`\n${ok.length} passed, ${fails.length} failed  (index.html = ${(bytes / 1024).toFixed(1)}KB)`);
for (const f of fails) console.log('  FAIL  ' + f);
if (fails.length) { console.log(''); process.exit(1); }
console.log('All criteria passed.\n');
