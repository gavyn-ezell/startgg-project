// Query Functions for site functionality


/*
*      query_player
*
*      Performs QUERY FOR PLAYER'S RECENT + UPCOMING TOURNAMENTS using fetch
*      
*      Variables:
*      playerId: ID of player we want to query
*      
*      
*/
export async function query_player_tournaments(playerId) {
  //set up query for fetch()
  let query_player_tournaments = `
  query ($playerId: ID!) {
    player (id: $playerId) {
      user {
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
      }
    }
  }
  `;

  //now we can perform the fetch request

  let result = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer c7ee5b396ab4bae2c39f64ac532c686b',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                'query': query_player_tournaments,
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