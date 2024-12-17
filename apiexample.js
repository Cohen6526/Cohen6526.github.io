// handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'inline-block';
  document.getElementById("middleman").style.textAlign = "center";

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});   


let apiURL = 'https://api.tvmaze.com/';

// initialize page after HTML loads
window.onload = function() {
   closeLightBox();  // close the lightbox because it's initially open in the CSS
   document.getElementById("button").onclick = function () {
     searchTvShows();
   };
   document.getElementById("lightbox").onclick = function () {
     closeLightBox();
   };
} // window.onload


// get data from TV Maze
async function searchTvShows() {
  document.getElementById("main").innerHTML = "";
  
  let search = document.getElementById("search").value;  
   
  try {   
      const response = await fetch(apiURL + 'search/shows?q=' + search);
      const data = await response.json();
      console.log(data);
      showSearchResults(data);
  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch
} // searchTvShows 
 

// change the activity displayed 
function showSearchResults(data) {
  
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for

} // updatePage

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
   let output = "<ul>";
   for (g in genres) {
      output += "<li>" + genres[g] + "</li>"; 
   } // for       
   output += "</ul>";
   return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow (tvshowJSON) {
  
    // get the main div tag
    var elemMain = document.getElementById("main");
    elemMain.style.display = "inline-block";
    document.getElementById("brs").style.display = "none";
    
    // create a number of new html elements to display tv show data
    var elemDiv = document.createElement("div");
    var elemImage = document.createElement("img");
    
    var elemShowTitle = document.createElement("h2");
    elemShowTitle.classList.add("showtitle"); // add a class to apply css
    
    var elemGenre = document.createElement("div");
    var elemRating = document.createElement("div");
    var elemSummary = document.createElement("div");
    
    // add JSON data to elements
    if( tvshowJSON.show.image != null){
    elemImage.src = tvshowJSON.show.image.medium;
    };
    elemShowTitle.innerHTML = tvshowJSON.show.name;
    elemShowTitle.style.textAlign = "center";
    elemGenre.innerHTML = "Genres: " + showGenres(tvshowJSON.show.genres);
    elemRating.innerHTML = "Rating: " + tvshowJSON.show.rating.average;
    elemSummary.innerHTML = tvshowJSON.show.summary;
    
       
    // add 5 elements to the div tag elemDiv
    elemDiv.appendChild(elemShowTitle); 
    elemDiv.appendChild(elemImage); 
    elemDiv.appendChild(elemGenre);
    elemDiv.appendChild(elemRating);
    elemDiv.appendChild(elemSummary);
    
    
    // get id of show and add episode list
    let showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);
    
    // add this tv show to main
    elemMain.appendChild(elemDiv);
    
} // createTVShow

// fetch episodes for a given tv show id
async function fetchEpisodes(showId, elemDiv) {
     
  console.log("fetching episodes for showId: " + showId);
  
  try {
     const response = await fetch(apiURL + 'shows/' + showId + '/episodes');  
     const data = await response.json();
     console.log("episodes");
     console.log(data);
     showEpisodes(data, elemDiv);
  } catch(error) {
    console.error('Error fetching episodes:', error);
  } // catch
    
} // fetch episodes


// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
     
  let marker = document.createElement("div");
  marker.innerHTML = "Episodes: "
  elemDiv.appendChild(marker);
    let elemEpisodes = document.createElement("div");  // creates a new div tag
    let output = "<ol>";
    for (episode in data) {
        output += "<li><a href='javascript:showLightBox(" + data[episode].id + ")' class='Episodes'>" + data[episode].name + "</a></li>";
    }
    output += "</ol>";
    elemEpisodes.innerHTML = output;
    elemDiv.appendChild(elemEpisodes);  // add div tag to page
    elemDiv.appendChild(document.createElement("hr"));
        
} // showEpisodes

// open lightbox and display episode info
async function showLightBox(episodeId){
     document.getElementById("message").innerHTML = " ";
     document.getElementById("lightbox").style.display = "block";
     document.getElementById("message").style.display = "grid";
    
     
     // show episode info in lightbox
     const response2 = await fetch("https://api.tvmaze.com/episodes/" + episodeId)
     const data2 = await response2.json();
     console.log(data2);

     //create title
     let elemEpiTitle = document.createElement("h3");
     elemEpiTitle.innerHTML = "Episode Title: " + data2.name;
     elemEpiTitle.classList.add("title");
     document.getElementById("message").appendChild(elemEpiTitle);
     
     //create image if it exists
     if(data2.image != null){
      let elemchild = document.createElement("img");
      elemchild.src = data2.image.medium;
     elemchild.alt = "Episode Image";
     elemchild.classList.add("image");
     document.getElementById("message").appendChild(elemchild);
     }
     //create season marker
     let elemSeason = document.createElement("p");
     elemSeason.innerHTML = "Season: " + data2.season;
     elemSeason.classList.add("season");
     document.getElementById("message").appendChild(elemSeason);

     //create episode marker
     let elemEpisode = document.createElement("p");
     elemEpisode.innerHTML = "Episode: " + data2.number;
     elemEpisode.classList.add("episode");
     document.getElementById("message").appendChild(elemEpisode);
      
     //creats summary if there is one, otherwise print an error code
     let elemSummary = document.createElement("p");
     elemSummary.classList.add("summary");
     if(data2.summary == null){
      elemSummary.innerHTML = "No Summary Available"
     }else{
      elemSummary.innerHTML = data2.summary;
     }
     document.getElementById("message").appendChild(elemSummary);

     //made areas for the message box NOT WORKING
     //document.getElementById("message").style.gridTemplateAreas = `
     //"title title"  
     //"image season"  
     //"image episode"  
     //"summary summary"`; 
     
} // showLightBox

 // close the lightbox
 function closeLightBox(){
     document.getElementById("lightbox").style.display = "none";
 } // closeLightBox 


// load the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
}  

             

