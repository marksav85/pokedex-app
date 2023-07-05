/* let pokemonList = [{name: 'Charmander', height: 0.6, types: ['fire']},
                   {name: 'Pikachu', height: 0.4, types: ['electric']}, 
                   {name: 'Bulbasaur', height: 0.7, types: ['grass', 'poison']}, 
                   {name: 'Squirtle', height: 0.5, types: ['water']}
                    ]; */

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
    if (typeof pokemon !== 'object'){
      console.log('input is not an object');
      } else if (Object.keys(pokemon) == 'name' || Object.keys(pokemon) == 'height' || Object.keys(pokemon) == 'types' && Object.keys(pokemon)) { 
          console.log('object successfully added')
          pokemonList.push(pokemon);
        } else {
          console.log('object keyname is invalid');
          }
  };
      
  return {
    add: add,
    getAll: getAll
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