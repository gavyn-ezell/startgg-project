// Query Functions for site functionality

/*
*  One giant query that gets player's recent placements, upcoming tournies, and socials
*
*/
export async function query_playercard_info(playerId) {

  //setting up the query
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
        images {
          height
          url
          width
          type
        }
      }
    }
  }
  `;

  let result = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer c7ee5b396ab4bae2c39f64ac532c686b',
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
  console.log(result);
  return result;
}