const fetch = require('node-fetch');
require('dotenv').config();

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
module.exports.query_playercard_info = query_playercard_info;