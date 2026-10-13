let pokemonRepository = (function () {
  let pokemonList = [];
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=120';
  function getAll() { return pokemonList; }
  // Shared detail promises cache successful responses and in-flight requests.
  const detailCache = new Map();
  const speciesCache = new Map();
  const requestQueue = [];
  const maxRequests = 6;
  let activeRequests = 0;
  let modalSelection = 0;
  let initialDetailsPending = 0;
  const typeColors = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
    poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
    bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0',
    fire: '#FA6555', water: '#58ABF6', grass: '#48CFB2',
    electric: '#FFCE4B', psychic: '#FF6C92', ice: '#98D8D8',
    dragon: '#7038F8', dark: '#705848', fairy: '#F4A6C7',
  };

  // Bound all JSON requests, including retries, and time out stalled responses.
  function fetchJson(url, priority = false) {
    return new Promise(function (resolve, reject) {
      const request = { url: url, resolve: resolve, reject: reject };
      if (priority) { requestQueue.unshift(request); } else { requestQueue.push(request); }
      runRequests();
    });
  }

  function runRequests() {
    while (activeRequests < maxRequests && requestQueue.length) {
      const request = requestQueue.shift();
      activeRequests += 1;
      const controller = new AbortController();
      const timeout = setTimeout(function () { controller.abort(); }, 15000);
      Promise.resolve()
        .then(function () { return fetch(request.url, { signal: controller.signal }); })
        .then(function (response) {
          if (!response.ok) { throw new Error('HTTP ' + response.status); }
          return response.json();
        })
        .then(request.resolve, request.reject)
        .then(function () {
          clearTimeout(timeout);
          activeRequests -= 1;
          runRequests();
        });
    }
  }

  function colorFromDetails(pokemon) {
    return typeColors[pokemon.types[0].type.name] || '#A8A878';
  }

  function getPokemonColor(pokemon) {
    return loadDetails(pokemon).then(function () { return colorFromDetails(pokemon); });
  }

  const list = document.getElementById('pokemon-grid');
  const searchInput = document.getElementById('search-input');
  const dialog = document.getElementById('pokemon-dialog');
  const closeButton = document.getElementById('dialog-close');
  const content = document.getElementById('detail-content');
  let selectedVariant = 'normal';
  let activeTrigger = null;
  let focusRestored = true;
  let variantSelection = 0;
  let backdropPointer = false;
  const cardRenderers = new Map();
  const statLabels = [
    ['hp', 'HP', 'HP'], ['attack', 'ATK', 'Attack'], ['defense', 'DEF', 'Defense'],
    ['special-attack', 'SPA', 'Special Attack'], ['special-defense', 'SPD', 'Special Defense'],
    ['speed', 'SPE', 'Speed'],
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function displayName(name) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function entryId(pokemon) { return '#' + String(pokemon.id).padStart(3, '0'); }

  function setStatus(message) {
    const status = document.getElementById('application-status');
    status.textContent = message;
    status.hidden = !message;
  }

  function updateDetailStatus() {
    const failed = pokemonList.some(function (pokemon) { return pokemon.detailsFailed; });
    setStatus(initialDetailsPending ? 'Loading Pokémon details…' :
      (failed ? 'Some Pokémon details could not be loaded. Open a card to try again.' : ''));
  }

  function add(pokemon) {
    if (pokemon && typeof pokemon === 'object' && typeof pokemon.name === 'string') { pokemonList.push(pokemon); }
  }

  function filterSearch(word) {
    return pokemonList.filter(function (pokemon) { return pokemon.name.toLowerCase().includes(word.toLowerCase()); });
  }

  function searchResult(filteredPokemon) {
    const names = new Set(filteredPokemon.map(function (pokemon) { return pokemon.name; }));
    list.querySelectorAll('.pokemon-card').forEach(function (card) { card.hidden = !names.has(card.dataset.pokemonName); });
    const empty = document.getElementById('search-status');
    empty.hidden = filteredPokemon.length > 0 || pokemonList.length === 0;
    document.getElementById('result-count').textContent = filteredPokemon.length + ' displayed';
  }

  function searchItem() {
    searchResult(filterSearch(searchInput.value.trim()));
    document.getElementById('clear-search').hidden = !searchInput.value;
  }

  function clearSearch() { searchInput.value = ''; searchItem(); searchInput.focus(); }
  searchInput.addEventListener('input', searchItem);
  searchInput.form.addEventListener('submit', function (event) { event.preventDefault(); searchItem(); });
  document.getElementById('clear-search').addEventListener('click', clearSearch);
  document.getElementById('reset-search').addEventListener('click', clearSearch);

  function typeBadges(pokemon) {
    const badges = element('span', 'type-badges');
    pokemon.types.forEach(function (entry) {
      const badge = element('span', 'type-badge', displayName(entry.type.name));
      badge.style.setProperty('--badge-color', typeColors[entry.type.name] || typeColors.normal);
      badges.appendChild(badge);
    });
    return badges;
  }

  // Each render owns its image node. Old image events cannot change a new view.
  function artworkStage(pokemon, variant, isCurrent, lazy) {
    const stage = element('div', 'artwork-stage');
    const image = element('img', 'pokemon-artwork');
    image.alt = (variant === 'shiny' ? 'Shiny artwork of ' : 'Artwork of ') + displayName(pokemon.name);
    image.width = 475;
    image.height = 475;
    image.loading = lazy ? 'lazy' : 'eager';
    image.decoding = 'async';
    const feedback = element('span', 'artwork-feedback');
    const candidates = [
      { url: pokemon.artwork[variant], fallback: false },
      { url: pokemon.sprite[variant], fallback: true },
    ].filter(function (candidate, index, items) {
      return candidate.url && items.findIndex(function (item) { return item.url === candidate.url; }) === index;
    });
    let index = 0;
    function useCandidate() {
      if (!isCurrent()) { return; }
      const candidate = candidates[index];
      image.hidden = !candidate;
      feedback.hidden = Boolean(candidate && !candidate.fallback);
      feedback.textContent = candidate ? 'Sprite fallback' : 'Image unavailable.';
      if (candidate) {
        image.alt = (variant === 'shiny' ? 'Shiny ' : '') + (candidate.fallback ? 'sprite of ' : 'artwork of ') + displayName(pokemon.name);
        image.src = candidate.url;
      }
    }
    image.addEventListener('error', function () { if (isCurrent()) { index += 1; useCandidate(); } });
    stage.append(image, feedback);
    useCandidate();
    return stage;
  }

  function addListItem(pokemon, index) {
    const card = element('li', 'pokemon-card');
    card.dataset.pokemonName = pokemon.name;
    const button = element('button', 'card-trigger');
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'pokemon-dialog');
    button.setAttribute('aria-label', 'View details for ' + displayName(pokemon.name));
    // Phrasing content inside the button; block layout is supplied by CSS.
    const number = element('span', 'card-number', '—');
    const art = element('span', 'card-art');
    const identity = element('span', 'card-identity');
    identity.appendChild(element('span', 'card-name', displayName(pokemon.name)));
    let renderVersion = 0;
    art.textContent = 'Loading details…';
    button.append(number, art, identity);
    card.appendChild(button);
    list.appendChild(card);
    function render() {
      const version = ++renderVersion;
      card.style.setProperty('--type-color', colorFromDetails(pokemon));
      number.textContent = entryId(pokemon);
      art.textContent = '';
      // Card image container remains phrasing content.
      const stage = artworkStage(pokemon, 'normal', function () { return version === renderVersion; }, index >= 4);
      const wrapper = element('span', 'artwork-stage');
      while (stage.firstChild) { wrapper.appendChild(stage.firstChild); }
      art.appendChild(wrapper);
      identity.textContent = '';
      identity.append(element('span', 'card-name', displayName(pokemon.name)), typeBadges(pokemon));
    }
    cardRenderers.set(pokemon, render);
    button.addEventListener('click', function () { showDetails(pokemon, button); });
    return loadDetails(pokemon).then(function () { pokemon.detailsFailed = false; render(); }).catch(function () {
      pokemon.detailsFailed = true;
      art.textContent = 'Details unavailable. Open to try again.';
    });
  }

  function modalMessage(pokemon, message, pending) {
    content.textContent = '';
    const title = element('h2', 'modal-title', displayName(pokemon.name));
    title.id = 'detail-title';
    content.append(title, element('p', 'modal-feedback', message));
    content.setAttribute('aria-busy', String(pending));
  }

  function currentSelection(selection) { return dialog.open && selection === modalSelection; }

  function promoteRequest(url) {
    const index = requestQueue.findIndex(function (request) { return request.url === url; });
    if (index >= 0) { requestQueue.unshift(requestQueue.splice(index, 1)[0]); }
  }

  function showDetails(pokemon, trigger) {
    const selection = ++modalSelection;
    selectedVariant = 'normal';
    activeTrigger = trigger;
    focusRestored = false;
    modalMessage(pokemon, 'Loading details…', true);
    if (!dialog.open) { dialog.showModal(); }
    document.body.classList.add('dialog-open');
    closeButton.focus({ preventScroll: true });
    promoteRequest(pokemon.detailsUrl);
    return loadDetails(pokemon, true).then(function () {
      pokemon.detailsFailed = false;
      cardRenderers.get(pokemon)();
      updateDetailStatus();
      if (currentSelection(selection)) { renderModal(pokemon, selection); }
      return pokemon;
    }).catch(function () {
      if (currentSelection(selection)) { modalMessage(pokemon, 'Could not load details. Close and open this card to try again.', false); }
      return null;
    });
  }

  function requestDescription(pokemon, selection, description, retry) {
    description.textContent = 'Loading description…';
    description.setAttribute('aria-busy', 'true');
    return loadSpecies(pokemon).then(function (text) {
      if (currentSelection(selection)) {
        description.textContent = text || 'Description unavailable.';
        if (document.activeElement === retry) { closeButton.focus({ preventScroll: true }); }
        retry.hidden = true;
      }
    }).catch(function () {
      if (currentSelection(selection)) {
        description.textContent = 'Could not load the Pokédex description.';
        retry.hidden = false;
      }
    }).then(function () {
      if (currentSelection(selection)) { description.setAttribute('aria-busy', 'false'); }
    });
  }

  function renderModal(pokemon, selection) {
    content.textContent = '';
    content.setAttribute('aria-busy', 'false');
    const layout = element('div', 'dialog-layout');
    layout.style.setProperty('--type-color', colorFromDetails(pokemon));
    const identity = element('section', 'detail-identity');
    const title = element('h2', 'modal-title', displayName(pokemon.name));
    title.id = 'detail-title';
    identity.append(element('span', 'detail-number', entryId(pokemon)), title, typeBadges(pokemon));
    const visual = element('section', 'artwork-panel');
    const imageSlot = element('div', 'detail-image-slot');
    const variantControls = element('div', 'variant-controls');
    variantControls.setAttribute('role', 'group');
    variantControls.setAttribute('aria-label', 'Artwork variant');
    const variantStatus = element('p', 'variant-status');
    variantStatus.setAttribute('role', 'status');
    const buttons = {};
    function updateVariant(variant) {
      if (!currentSelection(selection)) { return; }
      selectedVariant = variant;
      const imageSelection = ++variantSelection;
      imageSlot.textContent = '';
      imageSlot.appendChild(artworkStage(pokemon, variant, function () {
        return currentSelection(selection) && imageSelection === variantSelection;
      }, false));
      Object.keys(buttons).forEach(function (name) { buttons[name].setAttribute('aria-pressed', String(name === variant)); });
      variantStatus.textContent = variant === 'shiny' ? 'Shiny artwork selected.' : '';
      if (!pokemon.artwork.shiny && !pokemon.sprite.shiny) { variantStatus.textContent = 'Shiny artwork unavailable.'; }
    }
    ['normal', 'shiny'].forEach(function (variant) {
      const button = element('button', 'variant-button', variant === 'normal' ? 'Normal' : 'Shiny ✦');
      button.type = 'button';
      button.disabled = !pokemon.artwork[variant] && !pokemon.sprite[variant];
      button.setAttribute('aria-pressed', String(variant === selectedVariant));
      button.addEventListener('click', function () { updateVariant(variant); });
      buttons[variant] = button;
      variantControls.appendChild(button);
    });
    visual.append(imageSlot, variantControls, variantStatus);
    const data = element('section', 'detail-data');
    const description = element('p', 'description');
    description.setAttribute('role', 'status');
    const retry = element('button', 'retry-description', 'Retry description');
    retry.type = 'button';
    retry.hidden = true;
    retry.addEventListener('click', function () { requestDescription(pokemon, selection, description, retry); });
    const metrics = element('dl', 'physical-metrics');
    [['Height', pokemon.height / 10 + ' m'], ['Weight', pokemon.weight === null ? 'Unavailable' : pokemon.weight / 10 + ' kg']].forEach(function (metric) {
      const group = element('div', 'metric');
      group.append(element('dt', '', metric[0]), element('dd', '', metric[1]));
      metrics.appendChild(group);
    });
    const stats = element('section', 'stats-section');
    stats.appendChild(element('h3', 'section-title', 'Base Stats'));
    statLabels.forEach(function (stat) {
      const value = pokemon.stats[stat[0]];
      const available = Number.isFinite(value);
      const row = element('div', 'stat-row');
      const label = element('span', 'stat-label');
      const abbreviation = element('span', 'stat-abbreviation', stat[1]);
      abbreviation.setAttribute('aria-hidden', 'true');
      label.append(abbreviation, element('span', 'sr-only', stat[2]));
      const number = element('span', 'stat-value', available ? String(value) : 'Unavailable');
      const track = element('span', 'stat-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = element('span', 'stat-fill');
      fill.style.width = (available ? Math.min(value / 255 * 100, 100) : 0) + '%';
      fill.style.backgroundColor = value < 50 ? '#FA6555' : value < 90 ? '#FFCE4B' : value < 120 ? '#48CFB2' : '#58ABF6';
      track.appendChild(fill);
      row.append(label, number, track);
      stats.appendChild(row);
    });
    const abilities = element('section', 'abilities-section');
    abilities.appendChild(element('h3', 'section-title', 'Abilities'));
    const abilityList = element('ul', 'ability-list');
    pokemon.abilities.forEach(function (entry) {
      const ability = element('li', 'ability', displayName(entry.ability.name));
      if (entry.is_hidden) { ability.appendChild(element('span', 'hidden-ability', 'Hidden')); }
      abilityList.appendChild(ability);
    });
    if (!pokemon.abilities.length) { abilityList.appendChild(element('li', 'ability', 'Unavailable')); }
    abilities.appendChild(abilityList);
    data.append(description, retry, metrics, stats, abilities);
    layout.append(identity, visual, data);
    content.appendChild(layout);
    updateVariant('normal');
    requestDescription(pokemon, selection, description, retry);
  }

  function closeDialog() {
    // Invalidate immediately, before the browser's queued close event.
    modalSelection += 1;
    variantSelection += 1;
    if (dialog.open) { dialog.close(); }
    cleanupDialog();
  }
  function cleanupDialog() {
    // Ignore a queued close event from a dialog that has already reopened.
    if (dialog.open) { return; }
    document.body.classList.remove('dialog-open');
    content.setAttribute('aria-busy', 'false');
    if (focusRestored) { return; }
    focusRestored = true;
    const trigger = activeTrigger;
    activeTrigger = null;
    if (trigger && trigger.isConnected && !trigger.closest('[hidden]')) { trigger.focus({ preventScroll: true }); }
    else { searchInput.focus({ preventScroll: true }); }
  }
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeDialog(); });
  dialog.addEventListener('close', function () {
    if (!dialog.open) { modalSelection += 1; variantSelection += 1; cleanupDialog(); }
  });
  function outside(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  }
  dialog.addEventListener('pointerdown', function (event) { backdropPointer = outside(event); });
  dialog.addEventListener('pointerup', function (event) { if (backdropPointer && outside(event)) { closeDialog(); } backdropPointer = false; });
  dialog.addEventListener('pointercancel', function () { backdropPointer = false; });

  function initialize() {
    searchInput.disabled = true;
    list.setAttribute('aria-busy', 'true');
    return loadList().then(function () {
      document.getElementById('loading-overlay').hidden = true;
      if (!pokemonList.length) { setStatus('No Pokémon are available. Please try reloading the page.'); return; }
      initialDetailsPending = pokemonList.length;
      setStatus('Loading Pokémon details…');
      const cards = pokemonList.map(function (pokemon, index) {
        return addListItem(pokemon, index).then(function () { initialDetailsPending -= 1; updateDetailStatus(); });
      });
      searchInput.disabled = false;
      searchItem();
      return Promise.all(cards);
    }).catch(function () { setStatus('Could not load Pokémon. Please check your connection and reload the page.'); }).then(function () {
      document.getElementById('loading-overlay').hidden = true;
      list.setAttribute('aria-busy', 'false');
    });
  }
  // LOADS POKEMON LIST FROM API
  function loadList() {
    return fetchJson(apiUrl).then(function (json) {
      if (!json || !Array.isArray(json.results) || json.results.some(function (item) {
        return !item || typeof item.name !== 'string' || !item.name ||
          typeof item.url !== 'string' || !item.url.startsWith('https://pokeapi.co/api/v2/pokemon/');
      })) { throw new Error('Invalid Pokémon list'); }
      pokemonList = [];
      json.results.slice(0, 120).forEach(function (item) {
        add({
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          detailsUrl: item.url,
        });
      });
    });
  }

  function loadDetails(item, priority = false) {
    const url = item.detailsUrl;
    if (!detailCache.has(url)) {
      const pending = fetchJson(url, priority).then(function (details) {
        if (!details || !Number.isFinite(details.height) || details.height < 0 ||
            !Number.isInteger(details.id) || details.id <= 0 ||

            !Array.isArray(details.types) || !details.types.length ||
            details.types.some(function (entry) {
              return !entry || !entry.type || typeof entry.type.name !== 'string';
            }) || !Array.isArray(details.abilities) ||
            details.abilities.some(function (entry) {
              return !entry || !entry.ability || typeof entry.ability.name !== 'string';
            })) { throw new Error('Invalid Pokémon details'); }
        return details;
      }).catch(function (error) {
        // Failed requests may be retried; successful responses remain cached.
        detailCache.delete(url);
        throw error;
      });
      detailCache.set(url, pending);
    }
    return detailCache.get(url).then(function (details) {
      const sprites = details.sprites || {};
      item.height = details.height;
      item.types = details.types;
      item.abilities = details.abilities;
      item.id = details.id;
      item.weight = Number.isFinite(details.weight) && details.weight >= 0 ? details.weight : null;
      const artwork = sprites.other && sprites.other['official-artwork'];
      const imageUrl = function (value) { return typeof value === 'string' && value.startsWith('https://') ? value : null; };
      item.artwork = {
        normal: imageUrl(artwork && artwork.front_default),
        shiny: imageUrl(artwork && artwork.front_shiny),
      };
      item.sprite = { normal: imageUrl(sprites.front_default), shiny: imageUrl(sprites.front_shiny) };
      item.speciesUrl = details.species && typeof details.species.url === 'string' &&
        details.species.url.startsWith('https://pokeapi.co/api/v2/pokemon-species/') ? details.species.url : null;
      item.stats = {};
      if (Array.isArray(details.stats)) {
        details.stats.forEach(function (entry) {
          if (entry && entry.stat && Number.isFinite(entry.base_stat) && entry.base_stat >= 0) {
            item.stats[entry.stat.name] = entry.base_stat;
          }
        });
      }
      return item;
    });
  }

  function loadSpecies(pokemon) {
    const url = pokemon.speciesUrl;
    if (!url) { return Promise.resolve(null); }
    if (!speciesCache.has(url)) {
      const pending = fetchJson(url, true).then(function (data) {
        if (!data || !Array.isArray(data.flavor_text_entries)) { throw new Error('Invalid species data'); }
        const english = data.flavor_text_entries.find(function (entry) {
          return entry && entry.language && entry.language.name === 'en' &&
            typeof entry.flavor_text === 'string' && entry.flavor_text.trim();
        });
        return english ? english.flavor_text.replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim() : null;
      }).catch(function (error) { speciesCache.delete(url); throw error; });
      speciesCache.set(url, pending);
    }
    return speciesCache.get(url);
  }

  return { add, getAll, filterSearch, addListItem, loadList, loadDetails, loadSpecies,
    searchItem, searchResult, getPokemonColor, initialize };
})();
let pokemonReady = pokemonRepository.initialize();
