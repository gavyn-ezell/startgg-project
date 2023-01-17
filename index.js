//Setting up Express app
const fetch = require('node-fetch');
const express = require('express');
const app = express();

require('dotenv').config();
app.set('view-engine', 'ejs');

app.use(express.urlencoded({ extended: false}));

app.use(express.static('public'))
app.listen(3000, () => console.log('Express App Listening at: 3000'));


app.get("/", (req, res) => {
  res.render('index.ejs');
})

app.get("/login", (req, res) => {
  res.render('login.ejs');
})

app.get("/register", (req, res) => {
  res.render('register.ejs');
})
/* 
* Server side POST request for grabbing a player's player card data 
*/
app.post('/player', async (request, response) => {
    const player_query = await query_playercard_info(request.query.playerId);
    return response.json(player_query);
});


/**
 * Given a playerId, grab the the necessary player card data using
 * Start.gg API. Uses GraphQL Query.
 * 
 * params playerId: String
 * 
 * returns: result: Object
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
            url
          }
        }
      }
    }
    `;
    //using query string for proper request for data
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