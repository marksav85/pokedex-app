let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=1200'

  function getAll() {
    return pokemonList;
  }

  
  function add(pokemon) {
    if (typeof pokemon === 'object' && 'name' in pokemon ){ // checks if input is an object and has a name property
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
    if (pokemon.types.length > 1) { // checks if pokemon has one or two types
      showModal(pokemon.name, `Height: ${pokemon.height} m`, `Types: ${pokemon.types[0].type.name} ${pokemon.types[1].type.name}`, pokemon.imageUrl); //outputs pokemon details with 2 types to modal
    } else {
      showModal(pokemon.name, `Height: ${pokemon.height} m`, `Type: ${pokemon.types[0].type.name}`, pokemon.imageUrl); //outputs pokemon details with 1 type to modal
    };
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


let modalContainer = document.querySelector('#modal-container');
function showModal(title, height, types, image) {
  // Clear all existing modal content
  
  modalContainer.innerHTML = '';
  
  let modal = document.createElement('div');
  modal.classList.add('modal');
  
  // Add the new modal content
  let closeButtonElement = document.createElement('button');
  closeButtonElement.classList.add('modal-close');
  closeButtonElement.innerText = 'X';
  closeButtonElement.addEventListener('click', hideModal);
  
  let titleElement = document.createElement('h1');
  titleElement.innerText = title;
  
  let heightElement = document.createElement('p');
  heightElement.innerText = height;

  let typesElement = document.createElement('p');
  typesElement.innerText = types;

  let imageElement = document.createElement('img');
  imageElement.src = image;
  

  
  modal.appendChild(closeButtonElement);
  modal.appendChild(titleElement);
  modal.appendChild(heightElement);
  modal.appendChild(typesElement);
  modal.appendChild(imageElement);

  modalContainer.appendChild(modal);
  
  modalContainer.classList.add('is-visible');
}

function hideModal() {
  modalContainer.classList.remove('is-visible');  
  modalContainer.classList.add('is-hidden');
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
    hideModal();  
  }
});

modalContainer.addEventListener('click', (e) => {
  // Since this is also triggered when clicking INSIDE the modal container,
  // We only want to close if the user clicks directly on the overlay
  let target = e.target;
  if (target === modalContainer) {
    hideModal();
  }
});

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