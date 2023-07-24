let pokemonRepository=function(){let e=[];function t(){return e}function n(t){"object"==typeof t&&"name"in t?e.push(t):console.log("input is not an object")}function i(e){return fetch(e.detailsUrl).then(function(e){return e.json()}).then(function(t){e.imageUrl=t.sprites.front_default,e.height=t.height,e.types=t.types}).catch(function(e){console.error(e)})}function o(e,t,n,i){let o=document.querySelector(".modal-content"),l=document.querySelector(".modal-body"),r=document.querySelector(".modal-title");document.querySelector(".modal-header"),r.innerText="",l.innerText="",l.setAttribute("style","background-color: #fff; color: #78c850ff;"),o.setAttribute("style","background-color: #9e7fdc; color: #fff;");let a=document.createElement("h1");a.innerText=e;let c=document.createElement("p");c.innerText=t,c.setAttribute("style","font-weight: bold;");let s=document.createElement("p");s.innerText=n,s.setAttribute("style","font-weight: bold;");let d=document.createElement("img");d.src=i,r.append(a),l.append(c),l.append(s),l.append(d)}return{add:n,getAll:t,filter:function t(n){return e.filter(function(e){return e.name.includes(n)})},addListItem:function e(t){let n=document.querySelector(".pokemon-list"),l=document.createElement("div");l.classList.add("card","text-center","d-inline-flex","align-items-center","justify-content-center","m-2","p-2","w-25","col-sm-12","col-md-6","col-lg-4","col-xl-3","col-xxl-2"),l.setAttribute("style","min-width: 175px");let r=document.createElement("img");r.classList.add("card-img-top","w-50"),r.src="",r.alt="pokemon image";let a=document.createElement("div");a.classList.add("card-body");let c=document.createElement("button");c.classList.add("btn"),c.setAttribute("type","button"),c.setAttribute("data-target","#pokemonModal"),c.setAttribute("data-toggle","modal"),c.setAttribute("style","background-color: #78c850ff; color: #fff;"),c.innerText=t.name,l.appendChild(r),l.appendChild(a),a.appendChild(c),n.appendChild(l),i(t).then(()=>{r.src=t.imageUrl}),c.addEventListener("click",function(){(function e(t){i(t).then(function(){t.types.length>1?o(t.name,`Height: ${t.height} m`,`Types: ${t.types[0].type.name} ${t.types[1].type.name}`,t.imageUrl):o(t.name,`Height: ${t.height} m`,`Type: ${t.types[0].type.name}`,t.imageUrl)})})(t)})},loadList:function e(){let t;return(t=document.querySelector("#loading")).classList.remove("is-hidden"),t.classList.add("is-visible"),fetch("https://pokeapi.co/api/v2/pokemon/?limit=120").then(function(e){let t;return(t=document.querySelector("#loading")).classList.remove("is-visible"),t.classList.add("is-hidden"),e.json()}).then(function(e){e.results.forEach(function(e){n({name:e.name.charAt(0).toUpperCase()+e.name.slice(1),detailsUrl:e.url})})}).catch(function(e){console.error(e)})},loadDetails:i}}();pokemonRepository.loadList().then(function(){pokemonRepository.getAll().forEach(function(e){pokemonRepository.addListItem(e)})});