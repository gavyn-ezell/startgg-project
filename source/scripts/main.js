window.addEventListener("DOMContentLoaded", init);


function init() {
    setupButton();
    initFormHandler();
}

function setupButton() {
    var test;
    let btn = document.getElementById('data-button');
    btn.addEventListener('click', async ()=> {
        //TODO: make test fetch request, put some response info into p element
        const div = document.getElementById('data');
        while (div.firstChild) {
            div.removeChild(div.lastChild);
        }
        //this query is for a tournament's placements
        // variable determines how many are shown (aka top3, top2, top8?)
        const query = `
        query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {
            event(id: $eventId) {
              id
              name
              standings(query: {
                perPage: $perPage,
                page: $page
              }){
                nodes {
                  placement
                  entrant {
                    id
                    name
                  }
                }
              }
            }
          }
        `;
        let r = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer c7ee5b396ab4bae2c39f64ac532c686b',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                'query': query,
                'variables': {
                    "eventId": 757796,
                    "page": 1,
                    "perPage": 8
                }
            })

        }).then(response => {
            return response.json();
        }).then(data => {
            console.log(data);
            return data;
        });
        
        let top = r.data.event.standings.nodes
        let topNum = r.data.event.standings.nodes.length;
        //div = document.getElementById('data');
        let h1 = document.createElement('h1')
        h1.innerHTML = "TOP " + topNum + " RESULTS FOR Port Priority 7";
        div.append(h1);
        
        for (x in top) {
            let currP = document.createElement('p');
            currP.innerHTML = top[x].placement + ' ' + top[x].entrant.name + 'ID: ' + top[x].entrant.id;
            //console.log(top3[x]);
            div.append(currP);
        }
    });
}

function initFormHandler() {
  //TODO: Grab the user inputted ID from the form submission box
  let theForm = document.querySelector('form')
  let submit = document.getElementById('player-search-form-submission');
  let ID;
  submit.addEventListener('click', async () => { 
    let formData = new FormData(theForm); 
    for (let [key, value] of formData) {
      
      ID = parseInt(value);
    }
    
    //ID = parseInt(formData['playerID']);
    //TODO: Make the query with given ID (given ID is playerID variable in query)
    const p_query = `
    query upcomingTournies($playerId: ID!, $page: Int!, $perPage: Int! ) {
      player (id: $playerId) {
        user {
          tournaments (query: {perPage: $perPage, page: $page}) {
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
    localStorage.setItem(1,1);

    let r = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer c7ee5b396ab4bae2c39f64ac532c686b',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                'query': p_query,
                'variables': {
                  "playerId": ID,
                  "page": 1,
                  "perPage": 5
                }
            })

        }).then(response => {
            console.log(response);
            return response.json();
        }).then(data => {
            console.log(data);
            return data;
        });

    //TODO: output upcoming tournaments to page after successful query
  });
}