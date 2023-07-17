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
    button.classList.add('btn');
    button.classList.add('btn-primary');
    button.setAttribute('type', 'button');
    button.setAttribute('data-target', '#pokemonModal');
    button.setAttribute('data-toggle', 'modal');

    listItem.classList.add('group-list-item');
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
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1), // capitalizes first letter of pokemon name
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
  
  let mainContent = document.querySelector('#main-content');
  
  function showModal(title, height, types, image) {
    
    // HTML variable elements for modal
    let modalBody = document.querySelector('.modal-body');
    let modalTitle = document.querySelector('.modal-title');
    let modalHeader = document.querySelector('.modal-header');

    // Clear all existing modal content
    
    modalTitle.innerText = '';
    modalBody.innerText = '';
    
    // create name element for modal
    let nameElement = document.createElement('h1');
    nameElement.innerText = title;

    // create height element for modal
    let heightElement = document.createElement('p');
    heightElement.innerText = height;

    // create types element for modal
    let typesElement = document.createElement('p');
    typesElement.innerText = types;

    // create image element for modal
    let imageElement = document.createElement('img');
    imageElement.src = image;

    modalTitle.append(nameElement);
    modalBody.append(heightElement);
    modalBody.append(typesElement);
    modalBody.append(imageElement);
    
    modal.classList.add('is-visible');
  }
  
  function hideModal() {
    modal.classList.remove('is-visible');  
    modal.classList.add('is-hidden');
  }
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
      hideModal();  
    }
  });
  
  mainContent.addEventListener('click', (e) => {
    // Since this is also triggered when clicking INSIDE the modal container,
    // We only want to close if the user clicks directly on the overlay
    let target = e.target;
    if (target === mainContent) {
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