
import { query_player_standings, query_player_tournaments } from './queries.js';
import players from './players.json' assert {type: 'json'};
//form initialization for player ID input
window.addEventListener("DOMContentLoaded", init);

function init() {
  
  initFormHandler();
  let input = document.getElementById("playerTag")
  autocomplete(input,Object.keys(players));
}

function initFormHandler() {


  
  
  
  //Grab the user inputted ID from the form submission box and make request
  let theForm = document.querySelector('form');
  theForm.addEventListener('submit', async (e) => {
    e.preventDefault();



    //clearing current player-tourney data being displayed
    let data = document.getElementById("player-tourney-data");
    
    document.getElementById("player-search-form-submission").setAttribute("disabled", true);
    while (data.hasChildNodes()) {
      data.removeChild(data.firstChild);
    }
    
    //grabbing inputted tag
    let formData = new FormData(theForm); 
    let playerTag = formData.get('playerTag');
    
    //checking if tag in our DB
    if (!(playerTag in players)) {
      let dataMsg = document.createElement('h1');
      dataMsg.innerText = `PLAYER NOT FOUND`;
      data.append(dataMsg);
      return;
    }
    
    let playerId = players[playerTag];

    //making the query then filtering upcoming tournies
    let result = await query_player_tournaments(playerId);
    /*
    *
    *  This checks if response gives any data for ID given,
    *  and if not, then we just tell user no ID found
    *  However, with eventual hardcoded database of names, this shouldnt need to exist
    */
    if (!(result.data.player)) {
      let dataMsg = document.createElement('h2');
      dataMsg.innerText = `ID not found`;
      data.append(dataMsg);
      return;
    }
    let tournies = result.data.player.user.tournaments.nodes;
    let upcomingTournies = []
    
    //we wanna grab tournies from now to later, for later organizing
    for (let i = 0; i < tournies.length; i++) {

      if (tournies[i.toString()].startAt >= Math.floor(Date.now() / 1000)) {
        upcomingTournies.push(tournies[i]);
      }
    }
    
    
    //are there any upcoming tournies!?
    let upcomingMsg = document.createElement('h2');
    if (upcomingTournies.length == 0) {
      upcomingMsg.innerText = `No Upcoming Tournies`;
      data.append(upcomingMsg);
    }
    else {
      upcomingMsg.innerText = `Upcoming Tournies`;
      data.append(upcomingMsg);
      while (upcomingTournies.length != 0) {
        let currP = document.createElement('p');
        let currTourney = upcomingTournies.pop();
        //grabbing date for display
        let currTimestamp = currTourney['startAt'] * 1000;
        const dateObject = new Date(currTimestamp);

        
        let currDate = dateObject.toLocaleString("en-US", {timeZoneName: "short"});
        currP.innerText = `${currTourney['name']}: ${currDate}`;
        data.append(currP);
      }
    }

    //now we want to grab recent standings
    result = await query_player_standings(playerId);
    let recentMsg = document.createElement('h2');
    recentMsg.innerText = `Recent Placements`;
    data.append(recentMsg);

    //placings is an array of objects
    let placings = result.data.player.recentStandings;
    for (let i in placings) {
      let currPlacing = document.createElement('p')
      let name = placings[i].entrant.event.tournament.name; 
      let eventName = placings[i].entrant.event.name;
      let attendance = placings[i].entrant.event.numEntrants;
      let placing = placings[i].placement
      
      currPlacing.innerText = `${name}: ${placing}/${attendance} in ${eventName}`;
      data.append(currPlacing)
    }
    
    document.getElementById("player-search-form-submission").removeAttribute("disabled");
  });
}

/*
*
* Function for autocomplete, taken from:
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


