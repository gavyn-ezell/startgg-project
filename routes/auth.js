const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');
const databaseHelpers = require('../utils/database')
const passport = require('passport');
require('../utils/local');

//SIMPLE middleware, if we are logged in (aka user session), never load the guest page, just go to user's dashboard
function alreadyAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/user/dashboard');
  }
  return next();
}

//LOGIN PAGE
router.get("/login", alreadyAuthenticated, (req, res) => {
  const message = req.flash('error');
  return res.render('login.ejs', { message: message });
})

//LOGIN POST
router.post("/login", [
  body('email', 'No email given').notEmpty(),
  body('email', 'Not a valid email').normalizeEmail().isEmail(),
  body('password').notEmpty(),
  body('password').isLength({min: 1, max: 20}),
  ],
  passport.authenticate('local', {
    successRedirect: '/user/dashboard',
    failureRedirect: '/user/login',
    failureFlash: 'Invalid login. Please try again.', 
  }));

//REGISTER PAGE
router.get("/register", alreadyAuthenticated, (req, res) => {
  const message = req.flash('error');
  return res.render('register.ejs', { message: message });
})

//REGISTER POST
router.post("/register", [
  body('email', 'empty email').notEmpty(),
  body('email', 'not an email').normalizeEmail().isEmail(),
  body('email', 'email already being used').normalizeEmail().custom((email) => {
    return databaseHelpers.emailExists(email).then(exists => {
      if (exists) {
        return Promise.reject('EMAIL IN USE ALREADY')
      }
    });
  }),
  body('password').notEmpty(),
  body('password').isLength({min: 1, max: 20}),
  body('cpassword').notEmpty(),
  body('cpassword').custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.errors[0].msg);
      req.flash('error', errors.errors[0].msg);
      return res.redirect('/user/register');
    }
    //we register our user into the DB!
    const hashedPassword = await bcrypt.hash(req.body.password, 13);
    databaseHelpers.addAccount(req.body.email, hashedPassword)
      .then(added => {
        if (added) {
          return res.redirect('/user/login')
        }
        return res.redirect('/user/register')
      }).catch((err) => {
        return res.redirect('/user/register');
      })
});

module.exports = router;