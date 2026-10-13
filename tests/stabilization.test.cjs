// Dependency-free source-level checks. This DOM double does not emulate browser
// layout, native keyboard events, Bootstrap focus trapping or CDN execution.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/js/bs-script.js', 'utf8');
const base = 'https://pokeapi.co/api/v2/pokemon/';

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.listeners = {};
    this.hidden = false;
    this.value = '';
    this.text = '';
    this.classes = new Set();
    this.classList = {
      add: (...values) => values.forEach(value => this.classes.add(value)),
      remove: (...values) => values.forEach(value => this.classes.delete(value)),
      contains: value => this.classes.has(value),
      toggle: (value, force) => force ? this.classes.add(value) : this.classes.delete(value),
    };
  }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set innerText(value) { this.textContent = value; }
  get innerText() { return this.textContent; }
  appendChild(child) { this.children.push(child); return child; }
  append(child) { this.appendChild(child); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; if (name === 'style') this.style = {}; }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  dispatch(name, event = {}) { (this.listeners[name] || []).forEach(handler => handler(event)); }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  querySelectorAll(selector) {
    const match = selector.split(' ').at(-1);
    return this.descendants().filter(child => match.startsWith('.') ? child.classes.has(match.slice(1)) : child.tagName === match.toUpperCase());
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

const listResult = names => ({ results: names.map((name, index) => ({ name, url: base + (index + 1) + '/' })) });
// Public API sample values retrieved 2026-10-13; only used fields are retained.
const detail = (id = 1, extra = {}) => ({
  id, height: 7,
  sprites: { front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/' + id + '.png' },
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  abilities: [{ ability: { name: 'overgrow' } }, { ability: { name: 'chlorophyll' } }],
  ...extra,
});
const response = (json, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => json });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const tick = () => new Promise(resolve => setImmediate(resolve));

function boot(responder, { script = source, timers } = {}) {
  const document = new Element('document');
  document.createElement = tag => new Element(tag);
  const ids = {};
  for (const id of ['search-input', 'loading-overlay', 'loading-finished', 'application-status', 'search-status']) {
    ids[id] = new Element(id === 'search-input' ? 'input' : 'div');
    document.append(ids[id]);
  }
  ids['loading-finished'].classList.add('pokemon-list');
  ids['loading-finished'].style.display = 'none';
  ids['search-input'].form = new Element('form');
  const modal = new Element();
  modal.classList.add('modal-content');
  for (const name of ['modal-title', 'modal-body', 'modal-height', 'modal-header', 'modal-footer']) {
    const child = new Element();
    child.classList.add(name);
    modal.append(child);
  }
  document.append(modal);
  document.getElementById = id => ids[id];
  const calls = [];
  const errors = [];
  const modalEvents = {};
  let active = 0, peak = 0;
  const context = vm.createContext({
    document, AbortController, setTimeout: timers?.setTimeout || setTimeout,
    clearTimeout: timers?.clearTimeout || clearTimeout,
    console: { log() {}, error: error => errors.push(error) },
    alert: message => errors.push(message),
    $: () => ({ on: (event, listener) => { modalEvents[event] = listener; } }),
    fetch: async (url, options) => {
      calls.push(url); active += 1; peak = Math.max(peak, active);
      try { return await responder(url, options, calls.filter(value => value === url).length); }
      finally { active -= 1; }
    },
  });
  vm.runInContext(script, context);
  return {
    document, ids, calls, errors, modalEvents,
    repository: vm.runInContext('pokemonRepository', context),
    ready: script === source ? vm.runInContext('pokemonReady', context) : null,
    cards: () => document.querySelectorAll('.pokemon-list .card'),
    body: () => document.querySelector('.modal-body'),
    title: () => document.querySelector('.modal-title'),
    peak: () => peak,
  };
}

function click(card) { card.querySelector('button').dispatch('click'); }
function search(app, value) { app.ids['search-input'].value = value; app.ids['search-input'].dispatch('input'); }

// Measured fetch invocations with synthetic responses, not production transfers.
test('120 cards use 121 JSON calls, at most six concurrent; repeat access uses cache', async () => {
  const names = Array.from({ length: 120 }, (_, index) => 'pokemon' + (index + 1));
  const app = boot(async url => {
    await tick();
    return response(url.includes('?') ? listResult(names) : detail(Number(url.split('/').at(-2))));
  });
  await app.ready;
  assert.equal(app.cards().length, 120);
  assert.equal(app.calls.length, 121);
  assert.equal(app.peak(), 6);
  assert.equal(app.ids['loading-finished'].getAttribute('aria-busy'), 'false');
  assert.equal(app.ids['application-status'].hidden, true);
  const first = app.cards()[0];
  assert.equal(first.style.backgroundColor, '#78C850');
  assert.equal(first.querySelector('img').src, detail().sprites.front_shiny);
  assert.equal(first.querySelector('.card-footer-element').textContent, '#1');
  assert.equal(first.querySelector('button').type, 'button');
  assert.equal(first.querySelector('button').getAttribute('data-toggle'), 'modal');
  click(first); await tick(); click(first); await tick();
  await app.repository.getPokemonColor(app.repository.getAll()[0]);
  assert.equal(app.calls.length, 121);
  assert.match(app.body().textContent, /Height: 0.7 m/);
  assert.match(app.body().textContent, /Type: grass poison/);
  assert.match(app.body().textContent, /Abilities: overgrow chlorophyll/);
  assert.equal(app.body().querySelector('img').alt, 'Shiny Pokemon1');
  assert.deepEqual(app.errors, []);
});

test('case-insensitive search, no results, clear and form submission', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur', 'charmander']) : detail()));
  await app.ready;
  search(app, 'BULBA');
  assert.equal(app.cards()[0].classList.contains('d-none'), false);
  assert.equal(app.cards()[1].classList.contains('d-none'), true);
  search(app, 'nonexistent');
  assert(app.cards().every(card => card.classList.contains('d-none')));
  assert.equal(app.ids['search-status'].hidden, false);
  assert.equal(app.ids['search-status'].textContent, 'No matching Pokémon found.');
  search(app, '');
  assert(app.cards().every(card => card.classList.contains('d-inline-flex')));
  assert.equal(app.ids['search-status'].hidden, true);
  let prevented = false;
  app.ids['search-input'].form.dispatch('submit', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(app.errors, []);
});

test('one type with two or three abilities, two types with one, and empty abilities', async () => {
  for (const [types, abilities] of [[['fire'], ['blaze', 'solar-power']], [['fire'], ['a', 'b', 'c']], [['grass', 'poison'], ['a']], [['fire'], []]]) {
    const app = boot(async url => response(url.includes('?') ? listResult(['charmander']) : detail(4, {
      height: 6,
      types: types.map(name => ({ type: { name } })),
      abilities: abilities.map(name => ({ ability: { name } })),
    })));
    await app.ready; click(app.cards()[0]); await tick();
    assert.match(app.body().textContent, /Height: 0.6 m/);
    assert(app.body().textContent.includes('Abilities: ' + (abilities.join(' ') || 'Unavailable')));
    assert.deepEqual(app.errors, []);
  }
});

test('initial and card loading states follow pending requests', async () => {
  const list = deferred(), details = deferred();
  const app = boot(url => url.includes('?') ? list.promise : details.promise);
  await tick();
  assert.equal(app.ids['loading-finished'].getAttribute('aria-busy'), 'true');
  assert.notEqual(app.ids['loading-overlay'].style.display, 'none');
  assert.equal(app.ids['search-input'].disabled, true);
  list.resolve(response(listResult(['bulbasaur']))); await tick();
  assert.equal(app.ids['loading-overlay'].style.display, 'none');
  assert.equal(app.ids['application-status'].textContent, 'Loading Pokémon details…');
  click(app.cards()[0]); await tick();
  assert.equal(app.body().getAttribute('aria-busy'), 'true');
  assert.equal(app.calls.length, 2, 'in-flight modal access shares the pending request');
  details.resolve(response(detail())); await app.ready; await tick();
  assert.equal(app.body().getAttribute('aria-busy'), 'false');
  assert.equal(app.ids['loading-finished'].getAttribute('aria-busy'), 'false');
  assert.equal(app.ids['application-status'].hidden, true);
});

test('empty lists and HTTP/network/invalid JSON/list responses show useful feedback', async () => {
  const variants = [
    async () => response({ results: [] }),
    async () => response({}, 503),
    async () => { throw new Error('offline'); },
    async () => ({ ok: true, json: async () => { throw new SyntaxError('bad JSON'); } }),
    async () => response({ unexpected: [] }),
    async () => response({ results: [{ name: 'test', url: 'bad' }] }),
  ];
  for (const responder of variants) {
    const app = boot(responder); await app.ready;
    assert.equal(app.cards().length, 0);
    assert.equal(app.ids['application-status'].hidden, false);
    assert.match(app.ids['application-status'].textContent, /No Pokémon|Could not load Pokémon/);
    assert.equal(app.ids['loading-overlay'].style.display, 'none');
    assert.equal(app.ids['loading-finished'].getAttribute('aria-busy'), 'false');
    assert.deepEqual(app.errors, []);
  }
});

test('failed details are visible, failed cache entries retry and card/modal recover', async () => {
  const app = boot(async (url, options, attempt) => {
    if (url.includes('?')) return response(listResult(['bulbasaur']));
    return attempt <= 2 ? response({}, 503) : response(detail());
  });
  await app.ready;
  assert.match(app.cards()[0].textContent, /Details unavailable/);
  assert.match(app.ids['application-status'].textContent, /Some Pokémon details/);
  click(app.cards()[0]); await tick();
  assert.match(app.body().textContent, /Could not load details/);
  assert.equal(app.body().getAttribute('aria-busy'), 'false');
  click(app.cards()[0]); await tick();
  assert.match(app.body().textContent, /Height: 0.7 m/);
  assert.equal(app.ids['application-status'].hidden, true);
  assert.equal(app.cards()[0].querySelector('.card-feedback').hidden, true);
  assert.equal(app.calls.length, 4);
  click(app.cards()[0]); await tick();
  assert.equal(app.calls.length, 4);
  assert.deepEqual(app.errors, []);
});

test('invalid detail schemas do not reach modal rendering', async () => {
  for (const invalid of [null, {}, detail(1, { height: '7' }), detail(1, { types: [] }), detail(1, { abilities: [{ ability: null }] })]) {
    const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : invalid));
    await app.ready; click(app.cards()[0]); await tick();
    assert.match(app.body().textContent, /Could not load details/);
    assert.equal(app.body().getAttribute('aria-busy'), 'false');
    assert.deepEqual(app.errors, []);
  }
});

test('unavailable and failed shiny images have visible fallback', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, { sprites: { front_shiny: null } })));
  await app.ready; click(app.cards()[0]); await tick();
  assert.equal(app.cards()[0].querySelector('img').hidden, true);
  assert.match(app.cards()[0].textContent, /Image unavailable/);
  assert.match(app.body().textContent, /Image unavailable/);
  const good = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await good.ready; click(good.cards()[0]); await tick();
  good.cards()[0].querySelector('img').dispatch('error');
  good.body().querySelector('img').dispatch('error');
  assert.equal(good.cards()[0].querySelector('img').hidden, true);
  assert.match(good.body().textContent, /Image unavailable/);
});

test('late modal success or failure cannot replace a newer selection or a closed view', async () => {
  const first = deferred(), second = deferred();
  const app = boot(url => url.includes('?') ? Promise.resolve(response(listResult(['bulbasaur', 'charmander']))) : (url === base + '1/' ? first.promise : second.promise));
  await tick();
  click(app.cards()[0]); click(app.cards()[1]); await tick();
  second.resolve(response(detail(4, { height: 6 }))); await tick();
  assert.equal(app.title().textContent, 'Charmander');
  first.reject(new Error('offline')); await app.ready; await tick();
  assert.equal(app.title().textContent, 'Charmander');
  assert.match(app.body().textContent, /0.6 m/);
  // A retry that resolves after hide must not overwrite the hidden modal.
  const late = deferred();
  const closing = boot(url => url.includes('?') ? Promise.resolve(response(listResult(['bulbasaur']))) : late.promise);
  await tick(); click(closing.cards()[0]); await tick();
  closing.modalEvents['hide.bs.modal']();
  late.resolve(response(detail())); await closing.ready; await tick();
  assert.match(closing.body().textContent, /Loading details/);
});

test('an older successful detail response cannot replace a newer selection', async () => {
  const first = deferred(), second = deferred();
  const app = boot(url => url.includes('?') ? Promise.resolve(response(listResult(['bulbasaur', 'charmander']))) : (url === base + '1/' ? first.promise : second.promise));
  await tick(); click(app.cards()[0]); click(app.cards()[1]); await tick();
  second.resolve(response(detail(4, { height: 6 }))); await tick();
  first.resolve(response(detail())); await app.ready; await tick();
  assert.equal(app.title().textContent, 'Charmander');
  assert.match(app.body().textContent, /Height: 0.6 m/);
  assert.deepEqual(app.errors, []);
});

test('stalled HTTP requests abort after 15 seconds and release loading state', async () => {
  const callbacks = new Map(); let next = 0;
  const app = boot((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')));
  }), { timers: {
    setTimeout(fn, milliseconds) { assert.equal(milliseconds, 15000); callbacks.set(++next, fn); return next; },
    clearTimeout(id) { callbacks.delete(id); },
  } });
  await tick();
  [...callbacks.values()].forEach(fn => fn());
  await app.ready;
  assert.match(app.ids['application-status'].textContent, /Could not load Pokémon/);
  assert.equal(app.ids['loading-overlay'].style.display, 'none');
  assert.equal(callbacks.size, 0);
});

// Optional baseline comparison uses a separately supplied copy of the old source.
if (process.env.POKEDEX_BASELINE) {
  test('baseline initiated 361 API calls for the same 120-item fixture', async () => {
    const original = fs.readFileSync(process.env.POKEDEX_BASELINE, 'utf8');
    const app = boot(async url => response(url.includes('?') ? listResult(Array.from({ length: 120 }, (_, i) => 'pokemon' + (i + 1))) : detail()), { script: original });
    await tick(); await tick();
    assert.equal(app.calls.length, 361);
    assert.equal(app.cards().length, 120);
  });
}
