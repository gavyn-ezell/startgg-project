const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const databaseHelpers = require('../utils/database')

passport.serializeUser((userID, done) => {
   // console.log("SERIALIZING USER");
    done(null, userID);
});

passport.deserializeUser((userID, done) => {
    //console.log("DESERIALIZING USER");
    return databaseHelpers.idExists(userID).then(found => {
        if (!found) {
        return done(null, null, { message: 'Invalid email or password' });
        }
        return done(null, userID);
    }).catch(err => done(err, null));
});
passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async function(email, password, done) {
    databaseHelpers.verifyLogin(email, password).then(userID => {
      if (userID == null) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, userID);
    }).catch(err => done(err));
  }));