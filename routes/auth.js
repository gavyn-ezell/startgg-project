const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');
const databaseHelpers = require('../utils/database')


//ROUTING FOR LOGIN/REGISTER
router.get("/login", (req, res) => {
  return res.render('login.ejs');
})

router.post("/login", [
  body('email', 'No email given').notEmpty(),
  body('email', 'Not a valid email').normalizeEmail().isEmail(),
  body('password').notEmpty(),
  body('password').isLength({min: 1, max: 20}),
  body('email', 'Account with email does not exist').normalizeEmail().custom((email, { req })=> {
    return databaseHelpers.verifyLogin(email, req.body.password).then(passwordMatch => {
      if (!passwordMatch) {        
        return Promise.reject("LOGIN FAILED, email or password is wrong");
      } 
    })
  })
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //TODO: FLASH A MESSAGE SAYING VALIDATORS CAUGHT SoMETHING
      return res.redirect('/user/login');
    }
  return res.redirect('/');
  })

router.get("/register", (req, res) => {
  res.render('register.ejs');
})

router.post("/register", [
  body('email', 'empty email').notEmpty(),
  body('email', 'not an email').normalizeEmail().isEmail(),
  body('email', 'email already being used').normalizeEmail().custom((email) => {
    return databaseHelpers.emailExists(email).then(exists => {
      if (exists) {
        console.log(exists)
        console.log(typeof(exists))
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
      //TODO: FLASH A MESSAGE SAYING VALIDATORS CAUGHT SoMETHING
      return res.redirect('/user/register');
    }
    //we register our user into the DB
    const hashedPassword = await bcrypt.hash(req.body.password, 13);
    databaseHelpers.addAccount(req.body.email, hashedPassword)
      .then(added => {
        if (added) {
          return res.redirect('/user/login')
        }
        return res.redirect('/user/register')
      }).catch((err) => {
        console.log(err)
      })
});

module.exports = router;