//DEPENDENCIES SETUP
const fetch = require('node-fetch');
const express = require('express');
const app = express();
require('dotenv').config();
const authRoute = require('./routes/auth');
const apiHelpers = require('./utils/helpers')
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false}));
app.use(express.static('public'))
app.use(express.json());

app.listen(3000, ()=> {console.log("LISTENING AT 3000")})
app.get("/", (req, res) => {
  return res.render('index.ejs')
})
app.use('/user', authRoute);

app.post('/player', async (request, response) => {
    const player_query = await apiHelpers.query_playercard_info(request.query.playerId);
    return response.json(player_query);
});