let pokemonRepository = (function () {
  let pokemonList = [{name: 'Charmander', height: 0.6, types: ['fire']},
                   {name: 'Pikachu', height: 0.4, types: ['electric']}, 
                   {name: 'Bulbasaur', height: 0.7, types: ['grass', 'poison']}, 
                   {name: 'Squirtle', height: 0.5, types: ['water']}
                    ];

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
      
  return {
    add: add,
    getAll: getAll,
  };

})();

let pokeList = pokemonRepository.getAll()

pokeList.forEach(function(pokemon) {
  if (pokemon.height > 0.6) {
      // adds extra span string if height above 0.6
      document.write ('<p>'), document.write(pokemon.name + ' (height: ' + pokemon.height + ') '), document.write('<span> - Wow, that\'s big!</span>'), document.write('</p>');
    } else {
      // otherwise just prints name and height
      document.write ('<p>'), document.write (pokemon.name + ' (height: ' + pokemon.height + ') '), document.write('</p>');
    }
  });