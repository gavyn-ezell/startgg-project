//PlayerCard.js

class PlayerCard extends HTMLElement {
    constructor() {
        super();

        let shadowEl = this.attachShadow({mode:'open'});
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
            padding: 40px;
            margin-top: 10px;
            height: 500px;
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

        .player-card > h2 {
            text-decoration: underline;
        }
        .player-card > p {
            font-size: 12px;
        }
        `;

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
   * @param {Object} data - The data to pass into the <recipe-card>, must be of the
   *                        following format:
   *                        {
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

    //setting up player's name at top of card
    let playerTag = document.createElement("h1");
    playerTag.innerText = data["playerTag"];
    divEl.append(playerTag);

    //setting up the images (profile pic, twitch and twitter if they exist)
    let pic = document.createElement("img");
    pic.setAttribute("src", data["pic"]);
    pic.setAttribute("alt", data["playerTag"]);
    pic.setAttribute("class", "pfp");
    divEl.append(pic);
    let br = document.createElement("br");
    divEl.append(br);


    if (data["twitchUrl"]) {
        let twitchBtn = document.createElement("a");
        twitchBtn.setAttribute("href", data["twitchUrl"]);
        let twitchImg = document.createElement("img");
        twitchImg.setAttribute("src", "./source/static/images/twitch.png");
        twitchImg.setAttribute("alt", "TWITCH");
        twitchImg.setAttribute("class", "socials");
        twitchBtn.append(twitchImg);

        divEl.append(twitchBtn);
        
    }
    
    if (data["twitterUrl"]) {
        let twitterBtn = document.createElement("a");
        twitterBtn.setAttribute("href", data["twitterUrl"]);

        let twitterImg = document.createElement("img");
        twitterImg.setAttribute("src", "./source/static/images/twt.png");
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
        //we just want to say no recent placements
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