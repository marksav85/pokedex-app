let pokemonRepository = (function () {
    let pokemonList = [];
    let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=120'
  
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

  function newItem(){

    //javascript
    //1. Adding a new item to the list of items: 
       let inputValue = document.getElementById("input").value;
    
       if (inputValue === '') {
         alert("You must write something!");
       } else {
        console.log(inputValue);
       };
    
    };
    
  
  function addListItem(pokemon) { // adds list item to DOM
    let list = document.querySelector('.pokemon-list');
    
    // create card
    let card = document.createElement('div');
    card.classList.add('card', 'text-center', 'd-inline-flex', 'align-items-center', 'justify-content-center', 'm-2', 'p-2', 'w-25', 'col-sm-12', 'col-md-6', 'col-lg-4', 'col-xl-3', 'col-xxl-2');
    card.setAttribute('style', 'min-width: 175px');
    let cardImage = document.createElement('img');
    cardImage.classList.add('card-img-top', 'w-50');
    cardImage.src = ''  // sets image source to empty string
    cardImage.alt = 'pokemon image';
    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    let cardButton = document.createElement('button');
    cardButton.classList.add('btn');
    cardButton.setAttribute('type', 'button');
    cardButton.setAttribute('data-target', '#pokemonModal');
    cardButton.setAttribute('data-toggle', 'modal');
    cardButton.setAttribute('style', 'background-color: #78c850ff; color: #fff;')
    cardButton.innerText = pokemon.name;
    card.appendChild(cardImage);
    card.appendChild(cardBody);
    cardBody.appendChild(cardButton);

    list.appendChild(card);

    loadDetails(pokemon).then(() => {
      cardImage.src = pokemon.imageUrl;
    });
    
    cardButton.addEventListener('click', function() { // adds event listener to button to display pokemon details
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
    });
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

  function showModal(title, height, types, image) {
    
    // HTML variable elements for modal
    let modalContent = document.querySelector('.modal-content');
    let modalBody = document.querySelector('.modal-body');
    let modalTitle = document.querySelector('.modal-title');
    let modalHeader = document.querySelector('.modal-header');

    // Clear all existing modal content
    
    modalTitle.innerText = '';
    modalBody.innerText = '';
    modalBody.setAttribute('style', 'background-color: #fff; color: #78c850ff;');
    modalContent.setAttribute('style', 'background-color: #9e7fdc; color: #fff;');
    
    // create name element for modal
    let nameElement = document.createElement('h1');
    nameElement.innerText = title;

    // create height element for modal
    let heightElement = document.createElement('p');
    heightElement.innerText = height;
    heightElement.setAttribute('style', 'font-weight: bold;');

    // create types element for modal
    let typesElement = document.createElement('p');
    typesElement.innerText = types;
    typesElement.setAttribute('style', 'font-weight: bold;');

    // create image element for modal
    let imageElement = document.createElement('img');
    imageElement.src = image;

    modalTitle.append(nameElement);
    modalBody.append(heightElement);
    modalBody.append(typesElement);
    modalBody.append(imageElement);
    
  }
  
  return {
    add: add,
    getAll: getAll,
    filter: filter,
    addListItem: addListItem,
    loadList: loadList,
    loadDetails: loadDetails,
    newItem: newItem
  };
  
  })();

  pokemonRepository.loadList().then(function() { // loads pokemon list from API
  pokemonRepository.getAll().forEach(function(pokemon) { // loops through pokemonList
    pokemonRepository.addListItem(pokemon)
    });
  });

  