let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=1200'

  function getAll() {
    return pokemonList;
  }

  
  function add(pokemon) {
    if (typeof pokemon === 'object' && 'name' in pokemon ){ 
      pokemonList.push(pokemon);
    } else { 
      console.log('input is not an object');
  };
};
      

function filter(word) { // filters pokemon by name
  let filteredList = pokemonList.filter(function(pokemon) {
    return pokemon.name.includes(word);
  });
  return filteredList;
}; 

function addListItem(pokemon) { // adds list item to DOM
  let list = document.querySelector('.pokemon-list');
  let listItem = document.createElement('li');
  let button = document.createElement('button');
  button.innerText = pokemon.name;
  button.classList.add('button-class');
  listItem.appendChild(button);
  list.appendChild(listItem);
  button.addEventListener('click', function() { // adds event listener to button to display pokemon details
    showDetails(pokemon);
  });
};

function showDetails(pokemon) { // displays pokemon details
  loadDetails(pokemon).then(function() {
    console.log(pokemon);
  });
}

function loadList() { // loads pokemon list from API
  showLoadingMessage(); //shows loading message while wating for response
  return fetch(apiUrl).then(function(response) {
    hideLoadingMessage(); // hides loading message when response is received
    return response.json();
  }).then(function(json) {
    json.results.forEach(function(item) {
      let pokemon = {
        name: item.name,
        detailsUrl: item.url
      };
      add(pokemon);
    });
  }).catch(function(e) {
    console.error(e);
  })
}

function loadDetails(item) { // loads pokemon details from API
  let url = item.detailsUrl;
  return fetch(url).then(function(response) {
    return response.json();
  }).then(function(details) {
    item.imageUrl = details.sprites.front_default;
    item.height = details.height;
    item.types = details.types;
  }).catch(function(e) {
    console.error(e);
  });
}

function showLoadingMessage() { // shows loading message
  let loading = document.querySelector('#loading');
  loading.classList.remove('is-hidden');
  loading.classList.add('is-visible');
}

function hideLoadingMessage() { // hide loading message
  let finishedLoading = document.querySelector('#loading');
  finishedLoading.classList.remove('is-visible');
  finishedLoading.classList.add('is-hidden');
}


return {
  add: add,
  getAll: getAll,
  filter: filter,
  addListItem: addListItem,
  loadList: loadList,
  loadDetails: loadDetails
};

})();

pokemonRepository.loadList().then(function() { // loads pokemon list from API
pokemonRepository.getAll().forEach(function(pokemon) { // loops through pokemonList
  pokemonRepository.addListItem(pokemon);
  });
});