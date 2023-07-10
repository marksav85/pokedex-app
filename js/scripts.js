let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/'

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
  console.log(pokemon.name + ' is ' + pokemon.height + 'm tall and is a ' + pokemon.types + ' type');
}

function loadList() { // loads pokemon list from API
  return fetch(apiUrl).then(function(response) {
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

return {
  add: add,
  getAll: getAll,
  filter: filter,
  addListItem: addListItem,
  loadList: loadList
};

})();

pokemonRepository.loadList().then(function() { // loads pokemon list from API
pokemonRepository.getAll().forEach(function(pokemon) { // loops through pokemonList
  pokemonRepository.addListItem(pokemon);
  });
});