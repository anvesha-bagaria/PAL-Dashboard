// Dependency-free Chrome smoke test for the static dashboard.
// Run with: node tests/smoke-browser.js
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const chromePath = process.env.PAL_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tabs = ['overview', 'schools', 'students', 'chapters', 'challenge', 'pipeline', 'health'];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(fn, label, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const value = await fn(); if (value) return value; } catch (_) {}
    await pause(60);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function staticServer() {
  return http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, content) => {
      if (error) { res.writeHead(404).end(); return; }
      const ext = path.extname(file);
      res.setHeader('Content-Type', ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' })[ext] || 'application/octet-stream');
      res.end(content);
    });
  });
}

class CDP {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.errors = []; }
  async open() {
    await new Promise((resolve, reject) => { this.socket.addEventListener('open', resolve, { once:true }); this.socket.addEventListener('error', reject, { once:true }); });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') this.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') this.errors.push(message.params.args.map(a => a.value || a.description || '').join(' '));
    });
  }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue:true, awaitPromise:true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  close() { this.socket.close(); }
}

async function run() {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}. Set PAL_CHROME_PATH to a Chrome binary.`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pal-chrome-'));
  const browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio:'ignore' });
  const server = staticServer();
  let client;
  try {
    const activePort = path.join(profile, 'DevToolsActivePort');
    const port = await waitFor(() => fs.existsSync(activePort) && Number(fs.readFileSync(activePort, 'utf8').split('\n')[0]), 'Chrome debugging port');
    const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'), 'Chrome page');
    client = new CDP(target.webSocketDebuggerUrl);
    await client.open();
    await client.send('Runtime.enable');
    await client.send('Page.enable');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const served = `http://127.0.0.1:${server.address().port}/dashboard.html#overview`;
    const file = `${pathToFileURL(path.join(root, 'dashboard.html')).href}#overview`;

    for (const [url, expected] of [[file, 'Bundled offline data'], [served, 'JSON files']]) {
      await client.send('Page.navigate', { url });
      await waitFor(() => client.evaluate(`document.querySelector('#source')?.textContent.includes(${JSON.stringify(expected)})`), expected);
      const source = await client.evaluate("document.querySelector('#source').textContent");
      console.log(`✓ ${source} (${url.startsWith('file:') ? 'file' : 'HTTP'})`);
    }

    const startTheme = await client.evaluate("document.documentElement.dataset.theme");
    await client.evaluate("document.querySelector('#theme-toggle').click()");
    const toggled = await client.evaluate("document.documentElement.dataset.theme");
    if (startTheme === toggled) throw new Error('Theme toggle did not change the theme');
    for (const theme of ['light', 'dark']) {
      await client.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      for (const tab of tabs) {
        await client.evaluate(`location.hash=${JSON.stringify(`#${tab}`)}`);
        await waitFor(() => client.evaluate(`document.querySelector('#tabpanel')?.getAttribute('aria-labelledby') === ${JSON.stringify(`tab-${tab}`)} && document.querySelector('#tabpanel')?.textContent.length > 50`), `${theme} ${tab}`);
        const selected = await client.evaluate("document.querySelectorAll('[role=tab][aria-selected=true]').length");
        if (selected !== 1) throw new Error(`${tab}: expected one selected tab, got ${selected}`);
        console.log(`✓ ${theme} / ${tab}`);
      }
    }

    const check = async (expression, label) => {
      if (!await client.evaluate(expression)) throw new Error(`UI check failed: ${label}`);
      console.log(`✓ ${label}`);
    };
    await client.evaluate("location.hash='#overview'");
    await check("document.querySelectorAll('.sidebar [role=tab]').length === 7 && !document.querySelector('.topbar #source') && !!document.querySelector('footer #source')", 'Sidebar and footer metadata');
    await check("document.querySelector('.histogram-bin') && document.querySelector('.stack-legend') && document.querySelector('.line-chart')", 'Overview chart types');
    await client.evaluate("document.querySelector('.bar-row')?.focus({preventScroll:true}); document.querySelector('.bar-row')?.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))");
    await check("!document.querySelector('#tooltip').hidden && document.querySelector('#tooltip').textContent.length > 0", 'Keyboard chart tooltip');
    await client.evaluate("location.hash='#students'");
    await waitFor(() => client.evaluate("!!document.querySelector('[data-student]')"), 'student table');
    await client.evaluate("document.querySelector('[data-status-chip=\"Needs support\"]').click()");
    await check("document.querySelector('[data-status-chip=\"Needs support\"]').getAttribute('aria-pressed') === 'true' && document.querySelector('#student-status').value === 'Needs support'", 'Student status chips');
    await client.evaluate("document.querySelector('[data-status-chip=\"\"]').click(); document.querySelector('[data-student] button').click()");
    await check("document.querySelector('#student-dialog').open", 'Student detail dialog');
    await client.evaluate("document.querySelector('.dialog-close').click()");
    await check("!document.querySelector('#student-dialog').open", 'Student dialog close');
    await client.evaluate("location.hash='#chapters'");
    await check("!!document.querySelector('.heatmap') && !!document.querySelector('#concept-graph svg') && !!document.querySelector('.graph-edge')", 'Chapter heatmap and prerequisite graph');
    await client.evaluate("location.hash='#challenge'");
    await check("document.querySelectorAll('.diagnostic-school').length > 0", 'Per-school diagnostic outcomes');
    await client.evaluate("location.hash='#pipeline'");
    await check("document.querySelector('#tabpanel').textContent.includes('Share') && document.querySelectorAll('#tabpanel .pill').length > 0", 'Pipeline shares and stage status');
    await client.evaluate("location.hash='#health'");
    await check("!!document.querySelector('.weekly-stacked') && !document.querySelector('#tabpanel').textContent.includes('422 errors per week')", 'Weekly recovery chart without 422 chart');

    await client.send('Emulation.setDeviceMetricsOverride', { width:400, height:900, deviceScaleFactor:1, mobile:false });
    for (const tab of tabs) {
      await client.evaluate(`location.hash=${JSON.stringify(`#${tab}`)}`);
      await waitFor(() => client.evaluate(`document.querySelector('#tabpanel')?.getAttribute('aria-labelledby') === ${JSON.stringify(`tab-${tab}`)}`), `mobile ${tab}`);
      const width = await client.evaluate('document.documentElement.scrollWidth');
      if (width > 400) throw new Error(`${tab}: document scroll width ${width}px at 400px`);
      console.log(`✓ 400px / ${tab}`);
    }

    await client.send('Page.navigate', { url:`http://127.0.0.1:${server.address().port}/tests/test-runner.html` });
    await waitFor(() => client.evaluate("document.querySelector('#summary')?.textContent.includes('passed')"), 'browser test runner');
    const summary = await client.evaluate("document.querySelector('#summary').textContent");
    const match = summary.match(/^(\d+) passed, (\d+) failed$/);
    if (!match || Number(match[1]) < 1 || Number(match[2]) !== 0) throw new Error(`Browser suite: ${summary}`);
    console.log(`✓ Browser suite: ${summary}`);
    if (client.errors.length) throw new Error(`Browser console errors:\n${client.errors.join('\n')}`);
    console.log('✓ No browser console errors');
  } finally {
    client?.close();
    await new Promise(resolve => server.close(resolve));
    if (browser.exitCode === null) {
      browser.kill();
      await Promise.race([new Promise(resolve => browser.once('exit', resolve)), pause(3000)]);
    }
    fs.rmSync(profile, { recursive:true, force:true, maxRetries:10, retryDelay:100 });
  }
}

run().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
