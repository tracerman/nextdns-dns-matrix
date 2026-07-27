const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function elementStub() {
  return {
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; },
    },
    dataset: {},
    addEventListener() {},
    setAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    appendChild() {},
    prepend() {},
    scrollIntoView() {},
    textContent: '',
    innerHTML: '',
    value: '',
    disabled: false,
    offsetWidth: 0,
  };
}

const elements = new Map();
const document = {
  getElementById(id) {
    if (id === 'matrixRain' || id === 'bannerTitle') return null;
    if (!elements.has(id)) elements.set(id, elementStub());
    return elements.get(id);
  },
  querySelectorAll() { return []; },
  createElement() {
    const el = elementStub();
    Object.defineProperty(el, 'innerHTML', {
      get() {
        return String(el.textContent)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      },
      set() {},
    });
    return el;
  },
};

const window = {
  location: { search: '' },
  matchMedia: () => ({ matches: true, addEventListener() {} }),
  addEventListener() {},
};
window.window = window;

const context = vm.createContext({
  AbortController,
  URLSearchParams,
  clearTimeout,
  console,
  document,
  fetch: () => Promise.reject(new Error('network disabled in logic tests')),
  navigator: { clipboard: { writeText: async () => {} } },
  performance,
  Promise,
  requestAnimationFrame: () => 0,
  setTimeout,
  window,
});
vm.runInContext(script, context);

function evaluate(expression, input) {
  context.__input = input;
  return vm.runInContext(expression, context);
}

function row(overrides) {
  return {
    family: 'IPv4',
    metric: 'server',
    status: 'ok',
    avgMs: 20,
    minMs: 20,
    jitter: 0,
    successRate: 100,
    ...overrides,
  };
}

test('anycast recommendation keeps the dns1 URL paired with dns1 addresses', () => {
  const rows = [
    row({ type: 'anycast', nodeId: 'anycast1', avgMs: 15, resolvedIP: '45.90.28.0' }),
    row({ type: 'anycast', nodeId: 'anycast2', avgMs: 17, resolvedIP: '45.90.30.0' }),
    row({ type: 'ultralow', nodeId: 'ultralow1', avgMs: 22, resolvedIP: '10.0.0.1' }),
    row({ type: 'server', nodeId: 'edge', server: 'edge-1', avgMs: 18, resolvedIP: '10.0.0.2' }),
  ];
  const tiers = evaluate(
    'buildRoutingTiers(__input, "abc123", selectPinTarget(__input), "auto")',
    rows,
  );
  const recommended = tiers.find(tier => tier.recommended);
  assert.equal(recommended.id, 'anycast');
  assert.equal(recommended.url, 'https://anycast.dns1.nextdns.io/abc123');
  assert.deepEqual([...recommended.addresses.ipv4], ['45.90.28.0']);
});

test('ultralow wins without producing a contradictory pin recommendation', () => {
  const rows = [
    row({ type: 'anycast', nodeId: 'anycast1', avgMs: 30 }),
    row({ type: 'ultralow', nodeId: 'ultralow1', avgMs: 10, resolvedIP: '10.0.0.1' }),
    row({ type: 'server', nodeId: 'edge', server: 'edge-1', avgMs: 12, resolvedIP: '10.0.0.2' }),
  ];
  const result = evaluate(
    '(() => { const pin = selectPinTarget(__input);'
      + ' const tiers = buildRoutingTiers(__input, "abc123", pin, "auto");'
      + ' return { worthIt: pin.worthIt, recommended: tiers.find(t => t.recommended).id }; })()',
    rows,
  );
  assert.deepEqual({ ...result }, { worthIt: false, recommended: 'ultralow' });
});

test('pinned tier carries matching IPv4 and IPv6 addresses when it clears the threshold', () => {
  const rows = [
    row({ type: 'anycast', nodeId: 'anycast1', avgMs: 30 }),
    row({ type: 'ultralow', nodeId: 'ultralow1', avgMs: 25, resolvedIP: '10.0.0.1' }),
    row({ type: 'server', nodeId: 'edge', server: 'edge-1', avgMs: 10, resolvedIP: '192.0.2.10' }),
    row({
      family: 'IPv6',
      type: 'server',
      nodeId: 'edge',
      server: 'edge-1',
      avgMs: 11,
      resolvedIP: '2001:db8::10',
    }),
  ];
  const tier = evaluate(
    'buildRoutingTiers(__input, "abc123", selectPinTarget(__input), "auto").find(t => t.recommended)',
    rows,
  );
  assert.equal(tier.id, 'pinned');
  assert.equal(tier.url, 'https://edge-1.edge.nextdns.io/abc123');
  assert.deepEqual([...tier.addresses.ipv4], ['192.0.2.10']);
  assert.deepEqual([...tier.addresses.ipv6], ['2001:db8::10']);
});

test('explicit anycast preference applies only inside the ten millisecond tolerance', () => {
  const rows = [
    row({ type: 'anycast', nodeId: 'anycast1', avgMs: 20 }),
    row({ type: 'ultralow', nodeId: 'ultralow1', avgMs: 15, resolvedIP: '10.0.0.1' }),
    row({ type: 'server', nodeId: 'edge', server: 'edge-1', avgMs: 16, resolvedIP: '10.0.0.2' }),
  ];
  const tier = evaluate(
    'buildRoutingTiers(__input, "abc123", selectPinTarget(__input), "anycast").find(t => t.recommended)',
    rows,
  );
  assert.equal(tier.id, 'anycast');
});

test('AI prompt retains a measured pinned alternative even when it is not recommended', () => {
  const rows = [
    row({ type: 'anycast', nodeId: 'anycast1', avgMs: 20 }),
    row({ type: 'ultralow', nodeId: 'ultralow1', avgMs: 15, resolvedIP: '10.0.0.1' }),
    row({ type: 'server', nodeId: 'edge', server: 'edge-1', avgMs: 16, resolvedIP: '10.0.0.2' }),
  ];
  const prompt = evaluate(
    '(() => { const tiers = buildRoutingTiers(__input, "abc123", selectPinTarget(__input), "auto");'
      + ' return buildAiPrompt({ routingTiers: tiers, recommendedTier: tiers.find(t => t.recommended) }, true); })()',
    rows,
  );
  assert.match(prompt, /Steered \/ Ultralow\s+\[RECOMMENDED\]/);
  assert.match(prompt, /Direct \/ Pinned/);
  assert.doesNotMatch(prompt, /ignore that option/i);
});

test('attribute escaping protects quoted data-copy values', () => {
  const escaped = evaluate('escAttr(__input)', 'x" data-pwn="1');
  assert.equal(escaped, 'x&quot; data-pwn=&quot;1');
});
