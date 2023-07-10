let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/'

  function getAll() {
    return pokemonList;
  }

  
  function add(pokemon) {
    let objectCount = 0; // counter to ensure position of keyname in object is in correct order
    let validObject = true; // if true then keynames valid
    if (typeof pokemon !== 'object'){ // if not an object then invalid
      console.log('input is not an object');
    } else if (Object.keys(pokemon).forEach(function(input) { // loop to check all keynames and positions are correct and in order
              if ((input === 'name' && objectCount == 0) || (input === 'height' && objectCount == 1) || (input === 'types' && objectCount == 2)) { 
                    objectCount += 1; 
                    validObject = true;

              } else {
                      console.log('invalid input'); // if keyname and/or position is false then invalid input
                      validObject = false;
              }
    })); 

    if (validObject == true) { // if object is valid then pushed to repository
      console.log('object successfully added to repository');
      pokemonList.push(pokemon);
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
  addListItem: addListItem
};

})();

let pokeList = pokemonRepository.getAll()
pokeList.forEach(function(pokemon) { // loops through pokemonList and prints name and height
  pokemonRepository.addListItem(pokemon);
  });