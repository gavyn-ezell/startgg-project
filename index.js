//SETTING UP OUR NODE APP DEPENDENCIES
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const app = express();
require('dotenv').config();
const authRoute = require('./routes/auth');
const loggedRoute = require('./routes/logged');
const api = require('./utils/api');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.use(cookieParser());
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//SIMPLE middleware, if we are logged in (aka user session), never load the guest page, just go to user's dashboard
function alreadyAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/user/dashboard');
  }
  return next();
}

app.listen(3000, ()=> {console.log("LISTENING AT 3000")})

//guest page, uses local storage for monitored list, doesn't need registered account
app.get("/", alreadyAuthenticated, (req, res) => {
  return res.render('index.ejs')
})
//routes for login page, and register page
app.use('/user', authRoute);
app.use('/user', loggedRoute);

//post request for grabbing a startgg User's information, using STARTGG API
app.post('/player', async (request, response) => {
    const player_query = await api.query_playercard_info(request.query.playerId);
    return response.json(player_query);
});