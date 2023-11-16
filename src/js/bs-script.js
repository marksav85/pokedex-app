//FETCH API

// gets all pokemon from API ans creates a pokemon list

let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=120";

  function getAll() {
    return pokemonList;
  }

  // fetches list of pokemon abilities
  function getAllAbilities(pokemon) {
    let pokeName = pokemon.name.toLowerCase();
    let pokeUrl = "https://pokeapi.co/api/v2/pokemon/" + pokeName;
    console.log(pokeUrl);
    return fetch(pokeUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (pokeUrl) {
        pokeUrl.abilities.forEach((entry) => {
          console.log(entry.ability.name);
          let pokeAbility = entry.ability.name;
          return pokeAbility;
        });
      });
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

  // filters the pokemonlist by name
  function filterSearch(word) {
    // filters pokemon by name
    let filteredList = pokemonList.filter(function (pokemon) {
      return pokemon.name.toLowerCase().includes(word.toLowerCase());
    });
    console.log(filteredList);
    return filteredList;
  }

  // takes value of search input and filters pokemon list
  function searchItem() {
    let inputValue = document.getElementById("search-input").value;

    if (inputValue === "") {
      // If the input is empty, show all Pokémon cards
      showAllCards();
    } else {
      let filteredPokemon = filterSearch(inputValue);

      if (filteredPokemon.length === 0) {
        // If no matching Pokémon found, handle accordingly (e.g., display a message)
        alert("No matching Pokémon found!");
        return;
      }

      console.log(filteredPokemon);
      searchResult(filteredPokemon);
    }
  }
  // targets pokemon cards and displays only cards matching search input
  function searchResult(filteredPokemon) {
    let pokemonCards = document.querySelectorAll(".card");

    console.log(filteredPokemon);

    pokemonCards.forEach(function (card) {
      let cardName = card.querySelector("button");
      let cardNameText = cardName.innerText;
      if (
        filteredPokemon.some((pokemon) => cardNameText.includes(pokemon.name))
      ) {
        card.classList.add("d-inline-flex");
        card.classList.remove("d-none");
      } else {
        card.classList.add("d-none");
        card.classList.remove("d-inline-flex");
      }
    });
  }
  // displays all pokemon cards when search input is empty
  function showAllCards() {
    // Display all Pokémon cards
    let pokemonCards = document.querySelectorAll(".card");
    pokemonCards.forEach(function (card) {
      card.classList.add("d-inline-flex");
      card.classList.remove("d-none");
    });
  }
  // listens to search input for changes
  let searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    // Adds event listener to input for live search
    searchItem();
    console.log("search input changed");
  });

  // CREATE POKEMON CARDS

  // adds pokemon cards to DOM
  function addListItem(pokemon) {
    // adds list item to DOM
    let list = document.querySelector(".pokemon-list");

    // create card and classes
    let card = document.createElement("div");
    card.setAttribute("style", "min-width: 175px");
    card.classList.add(
      "card",
      "text-center",
      "d-inline-flex",
      "align-items-center",
      "justify-content-center",
      "m-2",
      "p-2",
      "w-25",
      "col-sm-12",
      "col-md-6",
      "col-lg-4",
      "col-xl-3",
      "col-xxl-2"
    );
    // create card header and attributes
    let cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");
    cardHeader.innerText = pokemon.name;

    // create card body and attributes
    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // create card footer and attributes
    let cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer");

    // create card image and attributes
    let cardImage = document.createElement("img");
    cardImage.classList.add("card-img-top", "w-50");
    cardImage.src = ""; // sets image source to empty string
    cardImage.alt = "pokemon image";

    // create card button and attributes
    let cardButton = document.createElement("button");
    cardButton.classList.add("btn");
    cardButton.setAttribute("type", "button");
    cardButton.setAttribute("data-target", "#pokemonModal");
    cardButton.setAttribute("data-toggle", "modal");
    cardButton.innerText = "View Card";

    // append card and attributes to DOM
    list.appendChild(card);
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    cardBody.appendChild(cardImage);
    card.appendChild(cardFooter);
    cardFooter.appendChild(cardButton);

    // fetches image and adds to card
    loadDetails(pokemon).then(() => {
      cardImage.src = pokemon.imageUrl;
    });

    // adds event listener to button to display pokemon details
    cardButton.addEventListener("click", function () {
      showDetails(pokemon);
    });
  }

  // FETCH POKEMON DATA FUNCTIONS

  // creates modal and adds pokemon details
  function showDetails(pokemon) {
    // displays pokemon details
    loadDetails(pokemon).then(function () {
      if (pokemon.types.length > 1) {
        // checks if pokemon has one or two types
        showModal(
          pokemon.name,
          `${pokemon.height} m`,
          `${pokemon.types[0].type.name} ${pokemon.types[1].type.name}`,
          pokemon.imageUrl
        ); //outputs pokemon details with 2 types to modal
      } else {
        showModal(
          pokemon.name,
          `${pokemon.height} m`,
          `${pokemon.types[0].type.name}`,
          pokemon.imageUrl
        ); //outputs pokemon details with 1 type to modal
      }
    });
  }

  // LOADS POKEMON LIST FROM API
  function loadList() {
    showLoadingMessage(); //shows loading message while wating for response
    return fetch(apiUrl)
      .then(function (response) {
        hideLoadingMessage(); // hides loading message when response is received
        return response.json();
      })
      .then(function (json) {
        //cycles through pokelist and updates cards
        json.results.forEach(function (item) {
          let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1), // capitalizes first letter of pokemon name
            detailsUrl: item.url,
          };
          add(pokemon);
        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  // loads pokemon details from API and updates modal
  function loadDetails(item) {
    let url = item.detailsUrl;
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        item.imageUrl = details.sprites.front_default;
        item.height = details.height;
        item.types = details.types;
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  // shows loading message
  function showLoadingMessage() {
    let loading = document.querySelector("#loading");
    loading.classList.remove("is-hidden");
    loading.classList.add("is-visible");
  }

  // hide loading message
  function hideLoadingMessage() {
    let finishedLoading = document.querySelector("#loading");
    finishedLoading.classList.remove("is-visible");
    finishedLoading.classList.add("is-hidden");
  }

  // CREATE MODAL LAYOUT

  //create modal scaffolding
  function showModal(title, height, types, image) {
    // HTML variable elements for modal
    let modalContent = document.querySelector(".modal-content");
    let modalHeader = document.querySelector(".modal-header");
    let modalTitle = document.querySelector(".modal-title");
    let modalBody = document.querySelector(".modal-body");
    let modalHeight = document.querySelector(".modal-height");
    let modalFooter = document.querySelector(".modal-footer");

    // Clear all existing modal content

    modalTitle.innerText = "";
    modalBody.innerText = "";
    /* modalBody.setAttribute(
      "style",
      "background-color: #fff; color: #78c850ff;"
    );
    modalContent.setAttribute(
      "style",
      "background-color: #9e7fdc; color: #fff;"
    ); */

    // create name element for modal title
    let nameElement = document.createElement("h1");
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

    // create image element for modal
    let modalImage = document.createElement("div");
    modalImage.classList.add("modal-image");
    let imageElement = document.createElement("img");
    imageElement.classList.add("modal-image");
    imageElement.src = image;

    // append modal info to DOM

    modalTitle.append(nameElement);
    modalBody.append(modalData);
    modalData.append(heightLabel);
    heightLabel.append(heightElement);
    modalData.append(typesLabel);
    typesLabel.append(typesElement);
    modalBody.append(modalImage);
    modalImage.append(imageElement);
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
    getAllAbilities: getAllAbilities,
  };
})();

// loads pokemon list from API
pokemonRepository.loadList().then(function () {
  // loops through pokemonList
  pokemonRepository.getAll().forEach(function (pokemon) {
    pokemonRepository.addListItem(pokemon);
    pokemonRepository.getAllAbilities(pokemon);
  });
});
