//PlayerCard.js
class PlayerCard extends HTMLElement {
    constructor() {
        super();

        //setting up shadow DOM
        let shadowEl = this.attachShadow({mode:'open'});
        //styling for player cards
        let styleEl = document.createElement("style")
        styleEl.textContent = `
        * {
            font-family: 'Heebo', sans-serif;
            color: whitesmoke;
        }
        .player-card {
            visibility: visible;
            border: 3px solid gray;
            border-radius: 7px;
            text-align: center;
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            padding: 30px;
            margin-top: 10px;
            height: auto;
            width: 400px;
        }
        .player-card > .pfp {
            border: 1px solid white;
            border-radius:50% 50% 50% 50%; 
            width:125px;
            height:125px;
            margin: auto;
        }
        .socials {
            width: 25px;
            height: 25px;
            margin-top: 7px;
            margin-right: 5px;
            margin-left: 5px;
        }
        .socials:hover {
            transform: scale(1.1);
        }

        .player-card > h2 {
            text-decoration: underline;
        }
        .player-card > p {
            font-size: 12px;
        }


        input[type=submit] {
            border: 1px solid transparent;
            background-color: grey;
            border-radius: 2px;
            position: relative;
            left: 50%;
            font-size: 12px;
            width: 50px;
            transform: translateX(-50%);
        }
        input[type=submit]:hover:not(.unpin){
            background-color: #3ad389;
        }
        
        .unpin:hover {
            background-color: #EE506A;
        }
        input[type=submit]:active {
            background-color: grey;
        }
        `;
        //final shadow DOM setup
        let cardDiv = document.createElement('div');
        cardDiv.setAttribute("class", "player-card");
        cardDiv.append(styleEl);
        shadowEl.append(cardDiv);
        this.shadowEl = shadowEl;
    }
   
   /**
   * Called when the .data property is set on this element.
   *
   *
   * param - data: Obejct
   * 
   * The data to pass into the <player-card>, must be of the
   *                        following format:
   *                        {
   *                          "needPin : bool,
   *                          "needRemove": bool,
   *                          "playerTag": "string",
   *                          "playerId": "string",
   *                          "pic": "string",
   *                          "twitchUrl": "string",
   *                          "twitterUrl": "string",
   *                          "upcoming": string array,
   *                          "recent": string array
   *                        }
   */
   set data(data) {
    if (!data) {
        return;
    }
    
    //grab div then populate afterwards
    let divEl = this.shadowEl.querySelector('div');
    
    /**
    *  Dealing with plus button for player-cards loaded by 
    *  user's search
    * 
    *  Plus sign should only show up if player isn't already pinned
    */
    if (data["needPin"]) {
       let pinBtn = document.createElement("input");
       pinBtn.setAttribute("type", "submit");
       pinBtn.setAttribute("value", "PIN");

       pinBtn.addEventListener("click", ()=> {
        if(confirm("Add player to dashboard?")) {
            let options = {
                "method": "POST"
            }
            fetch(`/user/addMonitored?sggID=${data["playerId"]}`, options);
            setTimeout(() => { location.reload(); }, 250);
            location.reload();

        }
    });
    
       divEl.append(pinBtn);
    }
    /**
    *  Dealing with plus button for player-cards loaded by 
    *  user's search
    * 
    *  Plus sign should only show up if player isn't already pinned
    */
    if (data["needRemove"]) {
        let removeBtn = document.createElement("input");
        removeBtn.setAttribute("type", "submit");
        removeBtn.setAttribute("value", "UNPIN");
        removeBtn.setAttribute("class", "unpin");
 
        removeBtn.addEventListener("click", ()=> {
            if(confirm("Remove player from dashboard?")) {
                let options = {
                    "method": "POST"
                }
                fetch(`/user/removeMonitored?sggID=${data["playerId"]}`, options);
                setTimeout(() => { location.reload(); }, 500);
                location.reload();
            }
        });
     
        divEl.append(removeBtn);
     }

    //setting up player's name at top of card
    let playerTag = document.createElement("h1");
    playerTag.innerText = data["playerTag"];
    divEl.append(playerTag);

    //setting up the player's PFP
    let pic = document.createElement("img");
    pic.setAttribute("src", data["pic"]);
    pic.setAttribute("alt", data["playerTag"]);
    pic.setAttribute("class", "pfp");
    divEl.append(pic);
    let br = document.createElement("br");
    divEl.append(br);

    //setting up socials respective socials buttons if exits
    if (data["twitchUrl"]) {
        let twitchBtn = document.createElement("a");
        twitchBtn.setAttribute("href", data["twitchUrl"]);
        let twitchImg = document.createElement("img");
        twitchImg.setAttribute("src", "/source/static/images/twitch.png");
        twitchImg.setAttribute("alt", "TWITCH");
        twitchImg.setAttribute("class", "socials");
        twitchBtn.append(twitchImg);

        divEl.append(twitchBtn);
        
    }
    
    if (data["twitterUrl"]) {
        let twitterBtn = document.createElement("a");
        twitterBtn.setAttribute("href", data["twitterUrl"]);

        let twitterImg = document.createElement("img");
        twitterImg.setAttribute("src", "/source/static/images/twt.png");
        twitterImg.setAttribute("alt", "TWITTER");
        twitterImg.setAttribute("class", "socials");
        twitterBtn.append(twitterImg);

        divEl.append(twitterBtn);

    }

    //populating card with upcoming tournies information
    let upcomingMsg = document.createElement("h2");
    let upcomingTournies = data["upcoming"];
    if (upcomingTournies.length == 0) {
        //we just want to say no tournies
        upcomingMsg.innerText = "No Upcoming Tournies";
        divEl.append(upcomingMsg);
    }
    else {
        upcomingMsg.innerText = "Upcoming Tournies";
        divEl.append(upcomingMsg);
        for (let i in upcomingTournies) {
            let currP = document.createElement("p");
            currP.innerText = upcomingTournies[i];
            divEl.append(currP);
        }
    }

    //populating card with recent placements information
    let recentMsg = document.createElement("h2");
    let recentStandings = data["recent"];
    if (recentStandings.length == 0) {
        recentMsg.innerText = "No Recent Placements";
        divEl.append(recentMsg);
    }
    else {
        recentMsg.innerText = "Recent Placements";
        divEl.append(recentMsg);
        for (let i in recentStandings) {
            let currP = document.createElement("p");
            currP.innerText = recentStandings[i];
            divEl.append(currP);
        }
    }
  }
}

customElements.define('player-card', PlayerCard);