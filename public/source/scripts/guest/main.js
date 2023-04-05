//using db for playerTag's associated playerId (within Startgg)
import players from '../players.json' assert {type: 'json'};
//setting up site on load
window.addEventListener("DOMContentLoaded", init);

/*
* Init function calls necessary functions for proper
* site setup and functionality (client side)
*
*/
function init() {
  window.scrollTo(0, 0);
  setupNavBar();
  loadPlayerCards();
  initFormHandler();
  let input = document.getElementById("playerTag")
  autocomplete(input, Object.keys(players));
}

/*
* Setups up navbar for proper scrolling and navigation
* throughout the website
*
*/
function setupNavBar() {
  let search = document.getElementById("search-nav");
  search.addEventListener("click", ()=>{
    document.getElementById("search-section").scrollIntoView({behavior:"smooth"});
  })
  let dashBoard = document.getElementById("dashboard-nav");
  dashBoard.addEventListener("click", ()=>{
    document.getElementById("dashboard-nav-pos").scrollIntoView({behavior:"smooth"});
  })
}

async function loadPlayerCards() {
  //grabbing reference to flexbox for player cards and players that we have to load
  let flexbox = document.getElementById("card-container");
  let pinnedPlayers = JSON.parse(localStorage.getItem("pinnedPlayers"));

  if (!(pinnedPlayers)) {
    localStorage.setItem("pinnedPlayers", JSON.stringify([]));
    return;
  }
  
  //load each player card
  for (let i in pinnedPlayers) {
    //make request and make object
    let playerCardObject = await makePlayerCardData(pinnedPlayers[i]);
    
    //create custom player card
    let playerCard = document.createElement('player-card')
    playerCardObject["needRemove"] = true;
    playerCard.data = playerCardObject;
    //add player card to flexbox
    flexbox.append(playerCard);
  }
}

/**
 * Given a playerTag, grab the the necessary player card data, and creating object
 * for setting up the custom PlayerCard element for dashboard
 * 
 * param - playerTag: String
*/
async function makePlayerCardData(playerTag) {
  
  //setting up and making request for player's data
  let playerId = players[playerTag];
  let result = {}
  let options = {
    "method": "POST"
  }
  let fetch_result = await fetch(`/player?playerId=${playerId}`, options);
  if (fetch_result==null) {
    return;
  }
  fetch_result = await fetch_result.json();
  console.log(fetch_result)
  
  //starts creating Object for custom player card
  
  //FIRST: Name, ID, Profile Picture
  result["playerTag"] = playerTag;
  result["playerId"] = playerId;
  result["pic"] = fetch_result.data.player.user.images[0].url;
  
    
  //SECOND: Player linked socials (Twitch, Twitter)
  let socials = fetch_result.data.player.user.authorizations;
  result["twitchUrl"] = null;
  result["twitterUrl"] = null;
  for (let i in socials) {
    if (socials[i].type == 'TWITTER') {
      if (socials[i].url) {
        result["twitterUrl"] = socials[i].url;
      }
    }
    else if (socials[i].type = 'TWITCH') {
      if (socials[i].url) {
        result["twitchUrl"] = socials[i].url;
      }
    }
  }

  //THIRD: Upcoming Tournaments for player
  result["upcoming"] = [];
  let tournies = fetch_result.data.player.user.tournaments.nodes;
  let upcomingTournies = []
  
  //we wanna grab tournies with TIMESTAMPS > currTIMESTAMP
  for (let i = 0; i < tournies.length; i++) {

    if (tournies[i.toString()].startAt >= Math.floor(Date.now() / 1000)) {
      upcomingTournies.push(tournies[i]);
    }
  }

  while (upcomingTournies.length != 0) {
    let currTourney = upcomingTournies.pop();
    //grabbing date for display
    let tourneyTimestamp = currTourney['startAt'] * 1000;
    const dateObject = new Date(tourneyTimestamp);

    //formatting string used for tourney info
    let tourneyDate = dateObject.toLocaleString("en-US", {timeZoneName: "short"});
    result["upcoming"].push(`${currTourney['name']}: ${tourneyDate}`);

  }

  //FOURTH: Recent Placements from Player
  
  result["recent"] = []
  
  //placings is an array of objects
  let placings = fetch_result.data.player.recentStandings;
  for (let i in placings) {
    //grabbing necessary data and formatting
    let name = placings[i].entrant.event.tournament.name; 
    let eventName = placings[i].entrant.event.name;
    let attendance = placings[i].entrant.event.numEntrants;
    let placing = placings[i].placement
    result["recent"].push(`${name}: ${placing}/${attendance} in ${eventName}`);
  }

  return result;
}


/*
* Setting up the form functionality
*
*/
function initFormHandler() {
  //Grab the user inputted ID from the form submission box and create player card
  let theForm = document.querySelector('form');
  theForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    

    //clearing before each search
    let searchDiv = document.getElementById("player-search-card");
    while (searchDiv.hasChildNodes()) {
      searchDiv.removeChild(searchDiv.firstChild);
    }
    
    //grabbing inputted tag
    let formData = new FormData(theForm); 
    let playerTag = formData.get('playerTag');
    
    //checking if tag in our DB, if not, don't make the card
    if (!(playerTag in players)) {
      let dataMsg = document.createElement('h1');
      dataMsg.innerText = `PLAYER NOT FOUND`;
      data.insertAdjacentElement("beforebegin", dataMsg);
      document.getElementById("player-search-form-submission").removeAttribute("disabled");
      return;
    }

    //making player card and adding to dashboard container
    let playerCardObject = await makePlayerCardData(playerTag);
    playerCardObject["needPin"] = !(JSON.parse(localStorage.getItem("pinnedPlayers")).includes(playerTag));
    let playerSearchCard = document.createElement('player-card')
    playerSearchCard.data = playerCardObject;
    searchDiv.append(playerSearchCard);
  });
}

/*
*
* Function for autocomplete in search bar, taken from:
* https://www.w3schools.com/howto/howto_js_autocomplete.asp
*
*/
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}