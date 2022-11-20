
import { query_player_tournaments } from './queries.js';

//form initialization for player ID input
window.addEventListener("DOMContentLoaded", init);

function init() {
  initFormHandler();
}

function initFormHandler() {

  //Grab the user inputted ID from the form submission box and make request
  let theForm = document.querySelector('form');
  theForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    //clearing current player-tourney data being displayed
    let data = document.getElementById("player-tourney-data");
    while (data.hasChildNodes()) {
      data.removeChild(data.firstChild);
    }
    
    //grabbing inputted ID
    let formData = new FormData(theForm); 
    let playerId = formData.get('playerID');

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
    let dataMsg = document.createElement('h2');
    if (upcomingTournies.length == 0) {
      dataMsg.innerText = `No Upcoming Tournies for ${playerId}`;
      data.append(dataMsg);
    }
    else {
      let count = 1
      dataMsg.innerText = `Upcoming Tournies for ${playerId}`;
      data.append(dataMsg);
      while (upcomingTournies.length != 0) {
        let currP = document.createElement('p');
        let currTourney = upcomingTournies.pop();
        //grabbing date for display
        let currTimestamp = currTourney['startAt'] * 1000;
        const dateObject = new Date(currTimestamp);

        
        let currDate = dateObject.toLocaleString("en-US", {timeZoneName: "short"});
        currP.innerText = `${count}. ${currTourney['name']}: ${currDate}`;
        data.append(currP);
        count++;
      }
    }

  });


}