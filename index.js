//setting up express app
const fetch = require('node-fetch');
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.static('public'))

app.listen(3000, () => console.log('Express App Listening at: 3000'));

//request for getting a player's information through the startgg api
app.post('/player', async (request, response) => {
    const player_query = await query_playercard_info(request.query.playerId);
    response.json(player_query);

});


/*
*  One giant query that gets player's recent placements, upcoming tournies, and socials
*
*/
async function query_playercard_info(playerId) {

    //setting up the query string
    let query_playercard_info = `
    query ($playerId: ID!) {
      player(id: $playerId) {
        recentStandings(videogameId: 1386, limit: 3) {
              placement
              entrant {
                event {
                  name
                  numEntrants
                  tournament {
                    name
                  }
                }
              }
            } 
        user {
          location {
            country
          }
          tournaments (query: {perPage: 8, page: 1}) {
              nodes {
                name
                slug
                id
                numAttendees
                countryCode
                startAt
              }
          }
          authorizations {
            externalUsername
            type
            url
          }
          images (type: "profile") {
            height
            url
            width
            type
          }
        }
      }
    }
    `;
    //using query string for proper api request
    let result = await fetch('https://api.start.gg/gql/alpha', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${process.env.API_KEY}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify({
                  'query': query_playercard_info,
                  'variables': {
                    "playerId": playerId
                  }
              })
  
          }).then(response => {
              return response.json();
          }).then(data => {
              return data;
          });
    return result;
}