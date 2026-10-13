// Dependency-free source-level checks. This DOM double does not emulate browser
// layout, native keyboard events or real dialog focus/inert behavior.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/js/bs-script.js', 'utf8');
const base = 'https://pokeapi.co/api/v2/pokemon/';

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = []; this.parentElement = null;
    this.attributes = {}; this.style = { setProperty(name, value) { this[name] = value; } };
    this.dataset = {}; this.listeners = {}; this.hidden = false; this.value = ''; this.text = '';
    this.classes = new Set(); this.open = false;
    this.classList = {
      add: (...values) => values.forEach(value => this.classes.add(value)),
      remove: (...values) => values.forEach(value => this.classes.delete(value)),
      contains: value => this.classes.has(value),
      toggle: (value, force) => force ? this.classes.add(value) : this.classes.delete(value),
    };
  }
  set className(value) { this.classes = new Set(value.split(/\s+/)); }
  get className() { return [...this.classes].join(' '); }
  set textContent(value) { this.text = value; this.children.forEach(child => { child.parentElement = null; }); this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set innerText(value) { this.textContent = value; }
  get innerText() { return this.textContent; }
  get firstChild() { return this.children[0]; }
  get isConnected() { return this.tagName === 'DOCUMENT' || Boolean(this.parentElement?.isConnected); }
  get form() { return this.closest('form'); }
  appendChild(child) {
    if (child.parentElement) child.parentElement.children = child.parentElement.children.filter(value => value !== child);
    child.parentElement = this; this.children.push(child); return child;
  }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  setAttribute(name, value) { this.attributes[name] = value; if (name === 'id') this.id = value; if (name === 'class') this.className = value; if (name === 'hidden') this.hidden = true; if (name === 'disabled') this.disabled = true; }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  dispatch(name, event = {}) { (this.listeners[name] || []).forEach(handler => handler({ target: this, ...event })); }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector) {
    if (selector === '[hidden]') return this.hidden;
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classes.has(selector.slice(1));
    return this.tagName === selector.toUpperCase();
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
  querySelectorAll(selector) { return this.descendants().filter(child => child.matches(selector.split(' ').at(-1))); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  focus() { let root = this; while (root.parentElement) root = root.parentElement; root.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatch('close'); }
  getBoundingClientRect() { return { left: 10, right: 300, top: 10, bottom: 500 }; }
}

// Parse the actual static page for hooks so missing/renamed IDs fail tests.
function pageDocument() {
  const document = new Element('document');
  const stack = [document];
  const html = fs.readFileSync('index.html', 'utf8');
  const voids = new Set(['META', 'LINK', 'INPUT', 'IMG', 'BR', 'PATH', 'CIRCLE']);
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)) {
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/)[1];
      const node = new Element(tag);
      for (const match of token.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
        if (match[1] !== tag) node.setAttribute(match[1], match[2] ?? '');
      }
      stack.at(-1).appendChild(node);
      if (!voids.has(node.tagName) && !token.endsWith('/>')) stack.push(node);
    } else { stack.at(-1).text += token.trim(); }
  }
  document.createElement = tag => new Element(tag);
  document.getElementById = id => document.descendants().find(node => node.id === id);
  document.body = document.querySelector('body');
  return document;
}

const listResult = names => ({ results: names.map((name, index) => ({ name, url: base + (index + 1) + '/' })) });
// Public API sample values retrieved 2026-10-13; only used fields are retained.
const detail = (id = 1, extra = {}) => ({
  id, height: 7, weight: 69,
  sprites: {
    front_default: 'https://sprites/normal/' + id + '.png',
    front_shiny: 'https://sprites/shiny/' + id + '.png',
    other: { 'official-artwork': { front_default: 'https://art/normal/' + id + '.png', front_shiny: 'https://art/shiny/' + id + '.png' } },
  },
  stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((name, index) => ({ stat: { name }, base_stat: 45 + index })),
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
  const document = pageDocument();
  const ids = Object.fromEntries(document.descendants().filter(node => node.id).map(node => [node.id, node]));
  const calls = [];
  const errors = [];
  let active = 0, peak = 0;
  const context = vm.createContext({
    document, AbortController, setTimeout: timers?.setTimeout || setTimeout,
    clearTimeout: timers?.clearTimeout || clearTimeout,
    console: { log() {}, error: error => errors.push(error) },
    alert: message => errors.push(message),
    fetch: async (url, options) => {
      calls.push(url); active += 1; peak = Math.max(peak, active);
      try { return await responder(url, options, calls.filter(value => value === url).length); }
      finally { active -= 1; }
    },
  });
  vm.runInContext(script, context);
  return {
    document, ids, calls, errors,
    repository: vm.runInContext('pokemonRepository', context),
    ready: script === source ? vm.runInContext('pokemonReady', context) : null,
    cards: () => document.querySelectorAll('.pokemon-card'),
    body: () => document.querySelector('.modal-body'),
    title: () => document.getElementById('detail-title'),
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
  assert.equal(app.ids['pokemon-grid'].getAttribute('aria-busy'), 'false');
  assert.equal(app.ids['application-status'].hidden, true);
  const first = app.cards()[0];
  assert.equal(first.style['--type-color'], '#48CFB2');
  assert.equal(first.querySelector('img').src, detail().sprites.other['official-artwork'].front_default);
  assert.equal(first.querySelector('.card-number').textContent, '#001');
  assert.equal(first.querySelector('button').type, 'button');
  assert.equal(first.querySelector('button').getAttribute('aria-controls'), 'pokemon-dialog');
  click(first); await tick(); click(first); await tick();
  await app.repository.getPokemonColor(app.repository.getAll()[0]);
  assert.equal(app.calls.length, 121);
  assert.match(app.body().textContent, /Height0.7 m/);
  assert.equal(app.body().querySelectorAll('.type-badge').map(node => node.textContent).join(' '), 'Grass Poison');
  assert.equal(app.body().querySelectorAll('.ability').map(node => node.textContent).join(' '), 'Overgrow Chlorophyll');
  assert.equal(app.body().querySelector('img').alt, 'artwork of Pokemon1');
  assert.deepEqual(app.errors, []);
});

test('case-insensitive search, no results, clear and form submission', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur', 'charmander']) : detail()));
  await app.ready;
  search(app, 'BULBA');
  assert.equal(app.cards()[0].hidden, false);
  assert.equal(app.cards()[1].hidden, true);
  search(app, 'nonexistent');
  assert(app.cards().every(card => card.hidden));
  assert.equal(app.ids['search-status'].hidden, false);
  assert.match(app.ids['search-status'].textContent, /No matching Pokémon found./);
  search(app, '');
  assert(app.cards().every(card => !card.hidden));
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
    assert.match(app.body().textContent, /Height0.6 m/);
    assert.equal(app.body().querySelectorAll('.ability').map(node => node.textContent).join(' '), abilities.map(name => name.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())).join(' ') || 'Unavailable');
    assert.deepEqual(app.errors, []);
  }
});

test('initial and card loading states follow pending requests', async () => {
  const list = deferred(), details = deferred();
  const app = boot(url => url.includes('?') ? list.promise : details.promise);
  await tick();
  assert.equal(app.ids['pokemon-grid'].getAttribute('aria-busy'), 'true');
  assert.equal(app.ids['loading-overlay'].hidden, false);
  assert.equal(app.ids['search-input'].disabled, true);
  list.resolve(response(listResult(['bulbasaur']))); await tick();
  assert.equal(app.ids['loading-overlay'].hidden, true);
  assert.equal(app.ids['application-status'].textContent, 'Loading Pokémon details…');
  click(app.cards()[0]); await tick();
  assert.equal(app.body().getAttribute('aria-busy'), 'true');
  assert.equal(app.calls.length, 2, 'in-flight modal access shares the pending request');
  details.resolve(response(detail())); await app.ready; await tick();
  assert.equal(app.body().getAttribute('aria-busy'), 'false');
  assert.equal(app.ids['pokemon-grid'].getAttribute('aria-busy'), 'false');
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
    assert.equal(app.ids['loading-overlay'].hidden, true);
    assert.equal(app.ids['pokemon-grid'].getAttribute('aria-busy'), 'false');
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
  assert.match(app.body().textContent, /Height0.7 m/);
  assert.equal(app.ids['application-status'].hidden, true);
  assert.equal(app.cards()[0].querySelector('img').hidden, false);
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
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, { sprites: {} })));
  await app.ready; click(app.cards()[0]); await tick();
  assert.equal(app.cards()[0].querySelector('img').hidden, true);
  assert.match(app.cards()[0].textContent, /Image unavailable/);
  assert.match(app.body().textContent, /Image unavailable/);
  const good = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await good.ready; click(good.cards()[0]); await tick();
  good.cards()[0].querySelector('img').dispatch('error');
  good.cards()[0].querySelector('img').dispatch('error');
  good.body().querySelector('img').dispatch('error');
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
  closing.ids['dialog-close'].dispatch('click');
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
  assert.match(app.body().textContent, /Height0.6 m/);
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
  assert.equal(app.ids['loading-overlay'].hidden, true);
  assert.equal(callbacks.size, 0);
});

test('new optional data normalizes artwork, weight and reordered base stats', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, {
    weight: 69,
    sprites: { front_default: 'https://sprites/normal.png', front_shiny: 'https://sprites/shiny.png', other: { 'official-artwork': { front_default: 'https://art/normal.png', front_shiny: 'https://art/shiny.png' } } },
    stats: [{ stat: { name: 'speed' }, base_stat: 45 }, { stat: { name: 'hp' }, base_stat: 45 }],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
  })));
  await app.ready;
  const pokemon = app.repository.getAll()[0];
  assert.equal(pokemon.weight / 10, 6.9);
  assert.equal(pokemon.artwork.normal, 'https://art/normal.png');
  assert.equal(pokemon.artwork.shiny, 'https://art/shiny.png');
  assert.equal(pokemon.stats.hp, 45);
  assert.equal(pokemon.stats.speed, 45);
  assert.equal(pokemon.stats.attack, undefined);
  assert.equal(pokemon.speciesUrl, 'https://pokeapi.co/api/v2/pokemon-species/1/');
});

test('species descriptions are English, normalized and cached lazily', async () => {
  const app = boot(async url => response(url.includes('pokemon-species') ? { flavor_text_entries: [
    { language: { name: 'ja' }, flavor_text: 'Japanese' },
    { language: { name: 'en' }, flavor_text: '  A\nseed\fPokémon.\t ' },
  ] } : url.includes('?') ? listResult(['bulbasaur']) : detail(1, { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } })));
  await app.ready;
  assert.equal(app.calls.length, 2);
  const pokemon = app.repository.getAll()[0];
  const results = await Promise.all([app.repository.loadSpecies(pokemon), app.repository.loadSpecies(pokemon)]);
  assert.deepEqual(results, ['A seed Pokémon.', 'A seed Pokémon.']);
  assert.equal(await app.repository.loadSpecies(pokemon), 'A seed Pokémon.');
  assert.equal(app.calls.length, 3);
});

test('species failures evict cache for retry; missing English description stays usable', async () => {
  const app = boot(async (url, options, attempt) => response(url.includes('pokemon-species') ? (attempt === 1 ? {} : { flavor_text_entries: [] }) : url.includes('?') ? listResult(['bulbasaur']) : detail(1, { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } })));
  await app.ready;
  const pokemon = app.repository.getAll()[0];
  await assert.rejects(app.repository.loadSpecies(pokemon));
  assert.equal(await app.repository.loadSpecies(pokemon), null);
  assert.equal(pokemon.height, 7);
  assert.equal(app.calls.length, 4);
});

test('modal shows metric units and six labelled stat values by name, including missing data', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, {
    stats: [{ stat: { name: 'speed' }, base_stat: 0 }, { stat: { name: 'hp' }, base_stat: 300 }, { stat: { name: 'special-defense' }, base_stat: 85 }],
  })));
  await app.ready; click(app.cards()[0]); await tick();
  assert.match(app.body().textContent, /Height0.7 mWeight6.9 kg/);
  const rows = app.body().querySelectorAll('.stat-row');
  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map(row => row.querySelector('.sr-only').textContent), ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed']);
  assert.deepEqual(rows.map(row => row.querySelector('.stat-value').textContent), ['300', 'Unavailable', 'Unavailable', 'Unavailable', '85', '0']);
  assert.equal(rows[0].querySelector('.stat-fill').style.width, '100%');
  assert.equal(rows[5].querySelector('.stat-fill').style.width, '0%');
  assert.equal(rows[5].querySelector('.stat-track').getAttribute('aria-hidden'), 'true');
  const missing = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, { sprites: null, stats: null, weight: 'bad' })));
  await missing.ready; click(missing.cards()[0]); await tick();
  assert.match(missing.body().textContent, /WeightUnavailable/);
  assert.match(missing.body().textContent, /Image unavailable/);
  assert.equal(missing.body().querySelectorAll('.stat-row').length, 6);
});

test('normal/shiny controls use actual artwork with no JSON refetch and reset on reopen', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await app.ready; click(app.cards()[0]); await tick();
  const controls = app.body().querySelectorAll('.variant-button');
  assert.equal(app.body().querySelector('img').src, 'https://art/normal/1.png');
  controls[1].dispatch('click');
  assert.equal(app.body().querySelector('img').src, 'https://art/shiny/1.png');
  assert.equal(app.body().querySelector('img').alt, 'Shiny artwork of Bulbasaur');
  assert.equal(controls[1].getAttribute('aria-pressed'), 'true');
  assert.equal(controls[0].getAttribute('aria-pressed'), 'false');
  assert.equal(app.calls.length, 2);
  app.ids['dialog-close'].dispatch('click'); click(app.cards()[0]); await tick();
  assert.equal(app.body().querySelector('img').src, 'https://art/normal/1.png');
  assert.equal(app.calls.length, 2);
});

test('artwork failure tries only the same-variant sprite; missing shiny is disabled', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await app.ready; click(app.cards()[0]); await tick();
  app.body().querySelectorAll('.variant-button')[1].dispatch('click');
  const shiny = app.body().querySelector('img');
  shiny.dispatch('error');
  assert.equal(shiny.src, 'https://sprites/shiny/1.png');
  assert.equal(shiny.alt, 'Shiny sprite of Bulbasaur');
  assert.match(app.body().textContent, /Sprite fallback/);
  shiny.dispatch('error');
  assert.equal(shiny.hidden, true);
  assert.match(app.body().textContent, /Image unavailable/);
  const missing = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, {
    sprites: { other: { 'official-artwork': { front_default: 'https://art/normal.png' } } },
  })));
  await missing.ready; click(missing.cards()[0]); await tick();
  assert.equal(missing.body().querySelectorAll('.variant-button')[1].disabled, true);
  assert.match(missing.body().textContent, /Shiny artwork unavailable/);
});

test('detached variant image errors cannot mutate the selected artwork', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await app.ready; click(app.cards()[0]); await tick();
  const normal = app.body().querySelector('img');
  app.body().querySelectorAll('.variant-button')[1].dispatch('click');
  const shiny = app.body().querySelector('img');
  normal.dispatch('error');
  assert.equal(app.body().querySelector('img'), shiny);
  assert.equal(shiny.src, 'https://art/shiny/1.png');
  app.ids['dialog-close'].dispatch('click'); shiny.dispatch('error');
  assert.equal(shiny.src, 'https://art/shiny/1.png');
});

test('description failure keeps core details and retry shares the recovered cache', async () => {
  const app = boot(async (url, options, attempt) => {
    if (url.includes('pokemon-species')) return response(attempt === 1 ? {} : { flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'A general Pokédex description.' }] });
    return response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } }));
  });
  await app.ready; click(app.cards()[0]); await tick();
  assert.match(app.body().textContent, /Could not load the Pokédex description/);
  assert.match(app.body().textContent, /Height0.7 m/);
  const retry = app.body().querySelector('.retry-description');
  assert.equal(retry.hidden, false); retry.dispatch('click'); await tick();
  assert.equal(app.body().querySelector('.description').textContent, 'A general Pokédex description.');
  assert.equal(retry.hidden, true);
  click(app.cards()[0]); await tick();
  assert.equal(app.calls.length, 4);
});

test('late species success/error cannot overwrite a newer selection or closed dialog', async () => {
  for (const failure of [false, true]) {
    const old = deferred();
    const app = boot(async url => {
      if (url.endsWith('pokemon-species/1/')) return old.promise;
      if (url.includes('pokemon-species')) return response({ flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'Current species.' }] });
      return response(url.includes('?') ? listResult(['bulbasaur', 'charmander']) : detail(Number(url.split('/').at(-2)), { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/' + url.split('/').at(-2) + '/' } }));
    });
    await app.ready; click(app.cards()[0]); await tick(); click(app.cards()[1]); await tick();
    if (failure) old.reject(new Error('offline')); else old.resolve(response({ flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'Stale species.' }] }));
    await tick();
    assert.equal(app.title().textContent, 'Charmander');
    assert.equal(app.body().querySelector('.description').textContent, 'Current species.');
  }
  const late = deferred();
  const closed = boot(async url => url.includes('pokemon-species') ? late.promise : response(url.includes('?') ? listResult(['bulbasaur']) : detail(1, { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } })));
  await closed.ready; click(closed.cards()[0]); await tick(); closed.ids['dialog-close'].dispatch('click');
  late.resolve(response({ flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'Late.' }] })); await tick();
  assert.equal(closed.body().querySelector('.description').textContent, 'Loading description…');
});

test('dialog handlers lock scroll and restore focus on close/Escape and guarded backdrop', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur']) : detail()));
  await app.ready; const trigger = app.cards()[0].querySelector('button'); click(app.cards()[0]); await tick();
  assert.equal(app.ids['pokemon-dialog'].open, true);
  assert.equal(app.document.body.classList.contains('dialog-open'), true);
  assert.equal(app.document.activeElement, app.ids['dialog-close']);
  let prevented = false;
  app.ids['pokemon-dialog'].dispatch('cancel', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(app.ids['pokemon-dialog'].open, false);
  assert.equal(app.document.body.classList.contains('dialog-open'), false);
  assert.equal(app.document.activeElement, trigger);
  // A queued close notification must not steal the restored trigger focus.
  app.ids['pokemon-dialog'].dispatch('close');
  assert.equal(app.document.activeElement, trigger);
  click(app.cards()[0]); await tick();
  const dialog = app.ids['pokemon-dialog'];
  dialog.dispatch('pointerdown', { clientX: 30, clientY: 30 });
  dialog.dispatch('pointerup', { clientX: 0, clientY: 0 });
  assert.equal(dialog.open, true, 'dragging from content must not dismiss');
  dialog.dispatch('pointerdown', { clientX: 0, clientY: 0 });
  dialog.dispatch('pointerup', { clientX: 0, clientY: 0 });
  assert.equal(dialog.open, false);
  click(app.cards()[0]); await tick(); search(app, 'missing');
  app.ids['dialog-close'].dispatch('click');
  assert.equal(app.document.activeElement, app.ids['search-input'], 'hidden trigger falls back to search');
});

test('clear and empty-state reset restore cards and search focus', async () => {
  const app = boot(async url => response(url.includes('?') ? listResult(['bulbasaur', 'charmander']) : detail()));
  await app.ready; search(app, 'missing');
  assert.equal(app.ids['clear-search'].hidden, false);
  app.ids['clear-search'].dispatch('click');
  assert.equal(app.ids['search-input'].value, '');
  assert(app.cards().every(card => !card.hidden));
  assert.equal(app.ids['clear-search'].hidden, true);
  assert.equal(app.document.activeElement, app.ids['search-input']);
  search(app, 'missing'); app.ids['reset-search'].dispatch('click');
  assert.equal(app.ids['search-status'].hidden, true);
  search(app, '#001'); assert.equal(app.ids['search-status'].hidden, false, 'search stays name-only');
});

test('combined details/species calls stay bounded at six and total 121 plus distinct opens', async () => {
  const app = boot(async url => {
    await tick();
    if (url.includes('pokemon-species')) return response({ flavor_text_entries: [] });
    return response(url.includes('?') ? listResult(Array.from({ length: 120 }, (_, index) => 'pokemon' + index)) : detail(Number(url.split('/').at(-2)), { species: { url: 'https://pokeapi.co/api/v2/pokemon-species/' + url.split('/').at(-2) + '/' } }));
  });
  await tick(); await tick();
  click(app.cards()[0]); await tick(); click(app.cards()[1]); await tick();
  await app.ready; await tick();
  assert.equal(app.calls.length, 123);
  assert.equal(app.peak(), 6);
  app.ids['dialog-close'].dispatch('click'); click(app.cards()[0]); await tick();
  assert.equal(app.calls.length, 123);
});
