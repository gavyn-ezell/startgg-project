//SETTING UP DEPENDENCIES
const { Router } = require('express');
const router = Router();
const databaseHelpers = require('../utils/database')
require('../utils/local');

//SIMPLE middleware, if we are logged in continue to logged routes, if not go to the guest page
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/');
}

router.get('/dashboard', ensureAuthenticated, async (req,res)=> {
    //grab all monitored players 
    const userID = req.user;
    databaseHelpers.grabUserMonitored(userID)
    .then(monitoredList => {
      if (monitoredList) {
        return res.render('dashboard', { monitoredList: monitoredList });
      }
      return res.redirect('/user/dashboard')
    }).catch((err) => {
      return res.redirect('/user/dashboard')
    })
});

//grab's the user's info, and displays to settings page
router.get('/settings', ensureAuthenticated, async(req,res)=> {
    const userID = req.user;
    databaseHelpers.grabUserInfo(userID)
    .then(userObject => {
      if (userObject) {
        return res.render('settings', userObject);
      }
      return res.redirect('/user/dashboard')
    }).catch((err) => {
      return res.redirect('/user/dashboard')
    })

});

//adding a new monitored player to user's current monitored list, updates sql database
router.post('/addMonitored', ensureAuthenticated, (req,res) => {
    databaseHelpers.addMonitored(req.user, req.query.sggID)
    .then(result => {
      if (result) {
        return res.status(200);
      }
      else {
        return res.redirect('/user/dashboard')
     }
    }).catch((err) => {
      console.log(err)
      return res.redirect('/user/dashboard')
    })
});

//removing a currently monitored player to user's current monitored list, updates sql database
router.post('/removeMonitored', ensureAuthenticated, (req,res) => {
    databaseHelpers.removeMonitored(req.user, req.query.sggID)
    .then(result => {
      if (result) {
        return res.status(200);
      }
      else {
        //console.log("FAILED TO REMOVE MONITORED PLAYER")
        return res.redirect('/user/dashboard')
     }
    }).catch((err) => {
      console.log(err)
      return res.redirect('/user/dashboard')
    })
});

//end session and go back to guest page
router.get("/logout", ensureAuthenticated, (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/");
    });
  });

module.exports = router;

