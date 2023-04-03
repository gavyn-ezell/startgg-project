//SETTING UP DEPENDENCIES
const { Router } = require('express');
const router = Router();
const {body, validationResult} = require('express-validator');
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
    const message = req.flash('error');
    const userID = req.user;
    databaseHelpers.grabUserInfo(userID)
    .then(userObject => {
      if (userObject) {
        userObject["message"] = message;
        return res.render('settings', userObject);
      }
      return res.redirect('/user/dashboard')
    }).catch((err) => {
      return res.redirect('/user/dashboard')
    })
});

router.post('/settings/addNumber', ensureAuthenticated, [
  body('areaCode', 'WRONG FORMAT FOR PHONE NUMBER').custom((areaCode) => {
    if (areaCode.length != 3) {
      throw new Error('WRONG FORMAT FOR PHONE NUMBER');
    }
    return true;
  }),
  body('threedig', 'WRONG FORMAT FOR PHONE NUMBER2').custom((threedig) => {
    
    if (threedig.length != 3) {
      throw new Error('WRONG FORMAT FOR PHONE NUMBER');
    }
    return true;
  }),
  body('fourdig', 'WRONG FORMAT FOR PHONE NUMBER3').custom((fourdig) => {
    
    if (fourdig.length != 4) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
  ],
  async(req,res)=> { 
    const errors = validationResult(req);
    //console.log(errors)
    if (!errors.isEmpty()) {
      req.flash('error', errors.errors[0].msg);
      return res.redirect('/user/settings');
    }
    
    //no error, update/add phonenumber to user in database
    const finalNumber = req.body.areaCode + req.body.threedig+ req.body.fourdig;
    databaseHelpers.updatePhoneNumber(req.user, finalNumber)
    .then(result => {
      if (result) {
        return res.redirect('/user/settings');
      }
      else {
        req.flash('error','FAILED TO UPDATE NUMBER');
        return res.redirect('/user/settings')
     }
    }).catch((err) => {
      req.flash('error','FAILED TO UPDATE NUMBER');
      return res.redirect('/user/settings')
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