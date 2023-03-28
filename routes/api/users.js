const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


//@route GET api/users/test
//@description tests users route
//@access Public
router.get('/test', (req,res) => res.send('User route testing'));

//@route GET api/users
//@description Get all users
//@access Public
router.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(404).json({nousersfound: "No users found"}))
});

// router.getOne('/')
  
  // @route POST api/users/register
  // @description add/save users
  // @access Public
  router.post('/register', async (req, res) => {
    try {
      const user = req.body;
  
      const takenEmail = await User.findOne({email: user.email})
  
      if(takenEmail) {
        return res.status(400).json({message: "Email is already taken"})
      } else {
        user.password = await bcrypt.hash(req.body.password, 10);
  
        const dbUser = new User({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          saved: [],
        });
  
        await dbUser.save();
        return res.json({message: "Success"});
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({message: "Internal server error"});
    }
  });


  //@route POST api/users/login
  //@description login users
  //@access Public

  router.post('/login', (req, res) => {
    const userLoggingIn = req.body;

    User.findOne({email: userLoggingIn.email})
    .then ( dbUser => {
      if (!dbUser) {
        return res.json({
          message: "Invalid Email or Password"
        })
      }
      bcrypt.compare(userLoggingIn.password, dbUser.password)
      .then(isCorrect => {
        if(isCorrect){
          const payload = {
            id: dbUser._id,
            email: dbUser.email,
            name: dbUser.firstName,
          }
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: 86400},
            (err, token) => {
              if (err) return res.json({message: err})
              return res.json({
                message: "Success",
                token:"Bearer " + token
              })
            }
          )
        } else {
          return res.json({
            message: "Invalid Email or Password"
          })
        }
      })
    })
  });
  
  
  // @route GET api/users/:id
  // @description Update user
  // @access Public
  router.put('/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body)
      .then(users => res.json({ msg: 'Updated successfully' }))
      .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  });
  
  // @route GET api/users/:id
  // @description Delete users by id
  // @access Public
  router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, req.body)
      .then(users => res.json({ mgs: 'User entry deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'No such user' }));
  });

  // @route GET api/users/getEmail
  // @description get logged in user by email
  // @access Public

  router.get("/getEmail", verifyJWT, (req, res) => {
    res.json({isLoggedIn: true, email: req.user.email, name: req.user.name})
  })

  function verifyJWT(req, res, next) {

    console.log(req.headers); 
    const token = req.headers["authorization"]?.split(' ')[1]
  
    if(token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.json({
          isLoggedIn: false,
          message: "Failed to Authenticate"
        })
        req.user = {};
        req.user.id = decoded.id
        req.user.email = decoded.email
        req.user.name = decoded.name
        next()
      })
    } else {
      res.json({message: "Incorrect Token Given", isLoggedIn: false, token: token})
    }
  }
  
  
  module.exports = router;