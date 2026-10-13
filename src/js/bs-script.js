//FETCH API

// gets all pokemon from API ans creates a pokemon list

let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=120";

  function getAll() {
    return pokemonList;
  }

  // Shared detail promises cache successful responses and in-flight requests.
  const detailCache = new Map();
  const requestQueue = [];
  const maxRequests = 6;
  let activeRequests = 0;
  let modalSelection = 0;
  let initialDetailsPending = 0;
  const typeColors = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
    poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
    bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0',
    fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8',
    dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC',
  };

  // Bound all JSON requests, including retries, and time out stalled responses.
  function fetchJson(url) {
    return new Promise(function (resolve, reject) {
      requestQueue.push({ url: url, resolve: resolve, reject: reject });
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

  //check if pokemon is an object and has a name property before adding to list
  function add(pokemon) {
    if (typeof pokemon === "object" && "name" in pokemon) {
      // checks if input is an object and has a name property
      pokemonList.push(pokemon);
    } else {
      console.log("input is not an object");
    }
  }

  // SEARCH FUNCTIONALITY
  function filterSearch(word) {
    return pokemonList.filter(function (pokemon) {
      return pokemon.name.toLowerCase().includes(word.toLowerCase());
    });
  }

  function searchResult(filteredPokemon) {
    const names = new Set(filteredPokemon.map(function (pokemon) { return pokemon.name; }));
    document.querySelectorAll('.pokemon-list .card').forEach(function (card) {
      const matches = names.has(card.dataset.pokemonName);
      card.classList.toggle('d-inline-flex', matches);
      card.classList.toggle('d-none', !matches);
    });
    const status = document.getElementById('search-status');
    status.textContent = filteredPokemon.length ? '' : 'No matching Pokémon found.';
    status.hidden = filteredPokemon.length > 0 || pokemonList.length === 0;
  }

  function searchItem() {
    searchResult(filterSearch(document.getElementById('search-input').value.trim()));
  }

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', searchItem);
  searchInput.form.addEventListener('submit', function (event) {
    event.preventDefault();
    searchItem();
  });

  // Bootstrap retains its native trigger focus-return handling.
  $('#pokemonModal').on('hide.bs.modal', function () {
    modalSelection += 1;
    document.querySelector('.modal-body').setAttribute('aria-busy', 'false');
  });

  // CREATE POKEMON CARDS

  // adds pokemon cards to DOM
  function addListItem(pokemon) {
    // adds list item and card to DOM
    let list = document.querySelector(".pokemon-list");
    let card = document.createElement("div");

    card.style.minWidth = '175px';
    card.style.backgroundColor = '#6c757d'; // Readable pending/failure fallback.
    card.dataset.pokemonName = pokemon.name;

    // create classes

    card.classList.add(
      "card",
      "text-center",
      "d-inline-flex",
      "align-items-center",
      "justify-content-center",
      "m-3",
      "p-2",
      "w-25",
      "col-sm-12",
      "col-md-6",
      "col-lg-4",
      "col-xl-3",
      "col-xxl-2"
    );
    // add color class

    // create card header and attributes
    let cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");
    let cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    const cardButton = document.createElement('button');
    cardButton.classList.add('card-trigger', 'stretched-link');
    cardButton.type = 'button';
    cardButton.textContent = pokemon.name;
    cardButton.setAttribute('aria-label', 'View details for ' + pokemon.name);
    cardButton.setAttribute('aria-haspopup', 'dialog');
    cardButton.setAttribute('data-target', '#pokemonModal');
    cardButton.setAttribute('data-toggle', 'modal');
    cardTitle.appendChild(cardButton);

    // create card body and attributes
    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // create card footer and attributes
    let cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer");
    let cardFooterLabel = document.createElement("p");
    cardFooterLabel.classList.add("card-footer-label");
    let cardFooterElement = document.createElement("span");
    cardFooterElement.classList.add("card-footer-element");
    cardFooterLabel.innerText = "Pokedex Entry: ";

    // create card image and attributes
    let cardImage = document.createElement("img");
    cardImage.classList.add("card-img-top", "w-100");
    cardImage.hidden = true;
    cardImage.alt = 'Shiny ' + pokemon.name;
    const cardFeedback = document.createElement('p');
    cardFeedback.classList.add('card-feedback');
    cardFeedback.textContent = 'Loading details…';

    // append card and attributes to DOM
    list.appendChild(card);
    card.appendChild(cardHeader);
    card.appendChild(cardTitle);
    card.appendChild(cardBody);
    cardBody.appendChild(cardImage);
    cardBody.appendChild(cardFeedback);
    card.appendChild(cardFooter);
    cardFooter.appendChild(cardFooterLabel);
    cardFooterLabel.appendChild(cardFooterElement);
    function renderCardDetails() {
      card.style.backgroundColor = colorFromDetails(pokemon);
      cardFooterElement.textContent = '#' + pokemon.id;
      cardImage.hidden = !pokemon.imageUrl;
      cardFeedback.hidden = Boolean(pokemon.imageUrl);
      cardFeedback.textContent = pokemon.imageUrl ? '' : 'Image unavailable.';
      if (pokemon.imageUrl) { cardImage.src = pokemon.imageUrl; }
    }
    cardImage.addEventListener('error', function () {
      cardImage.hidden = true;
      cardFeedback.hidden = false;
      cardFeedback.textContent = 'Image unavailable.';
    });

    cardButton.addEventListener('click', function () {
      showDetails(pokemon).then(function (loaded) {
        if (loaded) {
          pokemon.detailsFailed = false;
          renderCardDetails();
          updateDetailStatus();
        }
      });
    });

    return loadDetails(pokemon).then(function () {
      pokemon.detailsFailed = false;
      renderCardDetails();
    }).catch(function () {
      pokemon.detailsFailed = true;
      cardFeedback.textContent = 'Details unavailable. Open to try again.';
      cardFooterElement.textContent = 'Unavailable';
    });
  }

  // Populate the modal immediately; late responses cannot replace a new selection.
  function showModalMessage(pokemon, message, pending) {
    document.querySelector('.modal-title').textContent = pokemon.name;
    const body = document.querySelector('.modal-body');
    body.textContent = '';
    body.setAttribute('aria-busy', String(pending));
    document.querySelector('.modal-content').removeAttribute('style');
    const feedback = document.createElement('p');
    feedback.classList.add('modal-feedback');
    feedback.setAttribute('role', 'status');
    feedback.textContent = message;
    body.appendChild(feedback);
  }

  function showDetails(pokemon) {
    const selection = ++modalSelection;
    showModalMessage(pokemon, 'Loading details…', true);
    return loadDetails(pokemon).then(function () {
      if (selection === modalSelection) {
        showModal(
          pokemon,
          pokemon.name,
          (pokemon.height / 10) + ' m',
          pokemon.types.map(function (entry) { return entry.type.name; }).join(' '),
          pokemon.abilities.map(function (entry) { return entry.ability.name; }).join(' ') || 'Unavailable',
          pokemon.imageUrl
        );
      }
      return pokemon;
    }).catch(function () {
      if (selection === modalSelection) {
        showModalMessage(pokemon, 'Could not load details. Close and open this card to try again.', false);
      }
      return null;
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

  function loadDetails(item) {
    const url = item.detailsUrl;
    if (!detailCache.has(url)) {
      const pending = fetchJson(url).then(function (details) {
        if (!details || !Number.isFinite(details.height) || details.height < 0 ||
            !Number.isInteger(details.id) || details.id <= 0 ||
            !details.sprites || (details.sprites.front_shiny != null &&
              typeof details.sprites.front_shiny !== 'string') ||
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
      item.imageUrl = details.sprites.front_shiny || null;
      item.height = details.height;
      item.types = details.types;
      item.abilities = details.abilities;
      item.id = details.id;
      return item;
    });
  }

  function initialize() {
    searchInput.disabled = true;
    const list = document.querySelector('.pokemon-list');
    list.setAttribute('aria-busy', 'true');
    return loadList().then(function () {
      document.getElementById('loading-overlay').style.display = 'none';
      list.style.display = 'block';
      if (!pokemonList.length) {
        setStatus('No Pokémon are available. Please try reloading the page.');
        return;
      }
      setStatus('Loading Pokémon details…');
      initialDetailsPending = pokemonList.length;
      const cards = pokemonList.map(function (pokemon) {
        return addListItem(pokemon).then(function () {
          initialDetailsPending -= 1;
          updateDetailStatus();
        });
      });
      searchInput.disabled = false;
      searchItem();
      return Promise.all(cards).then(updateDetailStatus);
    }).catch(function () {
      setStatus('Could not load Pokémon. Please check your connection and reload the page.');
    }).then(function () {
      document.getElementById('loading-overlay').style.display = 'none';
      list.style.display = 'block';
      list.setAttribute('aria-busy', 'false');
    });
  }

  // CREATE MODAL LAYOUT

  //create modal scaffolding
  function showModal(pokemon, title, height, types, abilities, image) {
    // HTML variable elements for modal
    let modalContent = document.querySelector(".modal-content");
    let modalTitle = document.querySelector('.modal-title');
    let modalBody = document.querySelector('.modal-body');
    modalTitle.textContent = '';
    modalBody.textContent = '';
    modalBody.setAttribute('aria-busy', 'false');
    const color = colorFromDetails(pokemon);
    modalContent.style.backgroundColor = color;
    modalContent.style.color = color;

    // create name element for modal title
    let nameElement = document.createElement("span");
    nameElement.innerText = title;

    // create data elements for modal height data
    let modalData = document.createElement("div");
    modalData.classList.add("modal-data");
    let heightLabel = document.createElement("p");
    let heightElement = document.createElement("span");
    heightLabel.innerText = "Height: ";
    heightElement.innerText = height;

    //create modal types data
    let typesLabel = document.createElement("p");
    let typesElement = document.createElement("span");
    typesLabel.innerText = "Type: ";
    typesElement.innerText = types;

    // create modal abilities data
    let abilitiesLabel = document.createElement("p");
    let abilitiesElement = document.createElement("span");
    abilitiesLabel.innerText = "Abilities: ";
    abilitiesElement.innerText = abilities;

    // create image element for modal
    let modalImage = document.createElement("div");
    modalImage.classList.add("modal-image");
    let imageElement = document.createElement("img");
    imageElement.classList.add("modal-element");
    imageElement.alt = 'Shiny ' + title;
    if (image) {
      imageElement.src = image;
      imageElement.addEventListener('error', function () { modalImage.textContent = 'Image unavailable.'; });
    } else {
      modalImage.textContent = 'Image unavailable.';
    }

    // append modal info to DOM

    modalTitle.append(nameElement);
    modalBody.append(modalData);
    modalData.append(heightLabel);
    heightLabel.append(heightElement);
    modalData.append(typesLabel);
    typesLabel.append(typesElement);
    modalData.append(abilitiesLabel);
    abilitiesLabel.append(abilitiesElement);
    modalBody.append(modalImage);
    if (image) { modalImage.append(imageElement); }
  }

  return {
    add: add,
    getAll: getAll,
    filterSearch: filterSearch,
    addListItem: addListItem,
    loadList: loadList,
    loadDetails: loadDetails,
    searchItem: searchItem,
    searchResult: searchResult,
    getPokemonColor: getPokemonColor,
    initialize: initialize,
  };
})();

// Scripts are at the end of the document; initialization follows real requests.
let pokemonReady = pokemonRepository.initialize();
