window.addEventListener("DOMContentLoaded", init);


function init() {
    setupButton();
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
                    "perPage": 3
                }
            })

        }).then(response => {
            return response.json();
        }).then(data => {
            return data;
        });
        
        let top3 = r.data.event.standings.nodes
        //div = document.getElementById('data');
        let h1 = document.createElement('h1')
        h1.innerHTML = "TOP 3 RESULTS FOR PORT PRIORITY";
        div.append(h1);
        
        for (x in top3) {
            let currP = document.createElement('p');
            currP.innerHTML = top3[x].placement + top3[x].entrant.name;
            //console.log(top3[x]);
            div.append(currP);
        }
    });
}