//FETCH API

// gets all pokemon from API ans creates a pokemon list

let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=120";

  function getAll() {
    return pokemonList;
  }

  // fetches list of pokemon abilities

  function getPokemonColor(pokemon) {
    let pokeName = pokemon.name.toLowerCase();
    let pokeUrl = "https://pokeapi.co/api/v2/pokemon/" + pokeName;
    return fetch(pokeUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (pokemon) {
        let pokeType = pokemon.types[0].type.name;

        const typesData = [
          { name: "normal", eff: "11111½10½111111111", color: "A8A878" },
          { name: "fighting", eff: "21½½12½021111½212½", color: "C03028" },
          { name: "flying", eff: "12111½21½112½11111", color: "A890F0" },
          { name: "poison", eff: "111½½½1½0112111112", color: "A040A0" },
          { name: "ground", eff: "110212½1221½211111", color: "E0C068" },
          { name: "rock", eff: "1½21½121½211112111", color: "B8A038" },
          { name: "bug", eff: "1½½½111½½½1212112½", color: "A8B820" },
          { name: "ghost", eff: "0111111211111211½1", color: "705898" },
          { name: "steel", eff: "11111211½½½1½12112", color: "B8B8D0" },
          { name: "fire", eff: "11111½212½½2112½11", color: "F08030" },
          { name: "water", eff: "1111221112½½111½11", color: "6890F0" },
          { name: "grass", eff: "11½½22½1½½2½111½11", color: "78C850" },
          { name: "electric", eff: "11210111112½½11½11", color: "F8D030" },
          { name: "psychic", eff: "12121111½1111½1101", color: "F85888" },
          { name: "ice", eff: "11212111½½½211½211", color: "98D8D8" },
          { name: "dragon", eff: "11111111½111111210", color: "7038F8" },
          { name: "dark", eff: "1½11111211111211½½", color: "705848" },
          { name: "fairy", eff: "121½1111½½11111221", color: "EE99AC" },
        ];

        let color = null;
        typesData.forEach((type) => {
          if (type.name === pokeType) {
            color = `#${type.color}`;
          }
        });

        return color; // Return color from the function
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
      let cardName = card.querySelector(".card-title");
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
    // adds list item and card to DOM
    let list = document.querySelector(".pokemon-list");
    let card = document.createElement("div");

    // set background color to current pokemon
    const cardColor = getPokemonColor(pokemon)
      .then((color) => {
        card.setAttribute(
          "style",
          `min-width: 175px; background-color: ${color};`
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });

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
    cardTitle.innerText = pokemon.name;

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
    cardFooterLabel.innerText = "Pokedex Entry: #";

    // create card image and attributes
    let cardImage = document.createElement("img");
    cardImage.classList.add("card-img-top", "w-100");
    cardImage.src = ""; // sets image source to empty string
    cardImage.alt = "pokemon image";

    // create card button and attributes
    /*  let cardButton = document.createElement("button");
    cardButton.classList.add("btn"); */
    card.setAttribute("type", "button");
    card.setAttribute("data-target", "#pokemonModal");
    card.setAttribute("data-toggle", "modal");

    // append card and attributes to DOM
    list.appendChild(card);
    card.appendChild(cardHeader);
    card.appendChild(cardTitle);
    card.appendChild(cardBody);
    cardBody.appendChild(cardImage);
    card.appendChild(cardFooter);
    cardFooter.appendChild(cardFooterLabel);
    cardFooterLabel.appendChild(cardFooterElement);
    /* cardFooter.appendChild(cardButton); */

    // fetches image and adds to card
    loadDetails(pokemon).then(() => {
      cardImage.src = pokemon.imageUrl;
      cardFooterElement.innerText = pokemon.id;
    });

    // adds event listener to button to display pokemon details
    card.addEventListener("click", function () {
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
          pokemon,
          pokemon.name,
          `${pokemon.height} m`,
          `${pokemon.types[0].type.name} ${pokemon.types[1].type.name}`,
          `${pokemon.abilities[0].ability.name} ${pokemon.abilities[1].ability.name}`,
          `#${pokemon.id}`,

          pokemon.imageUrl
        ); //outputs pokemon details with 2 types to modal
      } else {
        showModal(
          pokemon,
          pokemon.name,
          `${pokemon.height} m`,
          `${pokemon.types[0].type.name}`,
          `${pokemon.abilities[0].ability.name}`,
          `${pokemon.id}`,

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
        item.imageUrl = details.sprites.front_shiny;
        item.height = details.height;
        item.types = details.types;
        item.abilities = details.abilities;
        item.id = details.id;
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
  function showModal(color, title, height, types, abilities, id, image) {
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
    // set background color to current pokemon
    const modalColor = getPokemonColor(color)
      .then((color) => {
        modalContent.setAttribute("style", `background-color: ${color};`);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

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
    let typeColor = types;

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
    imageElement.src = image;

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
    getPokemonColor: getPokemonColor,
  };
})();

// loads pokemon list from API
pokemonRepository.loadList().then(function () {
  // loops through pokemonList
  pokemonRepository.getAll().forEach(function (pokemon) {
    pokemonRepository.addListItem(pokemon);
    pokemonRepository.getPokemonColor(pokemon);
  });
});
