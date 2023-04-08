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

  router.get('/:id', (req, res) => {
    User.findById(req.params.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve user data.' });
      });
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

  // @route POST api/users/saved
  // @description add saved experiences to bucket list
  // @access Public

  router.post('/saved', async (req, res) => {
    const userId = req.body.userId;
    const experienceId = req.body.experienceId;
  
    try {
      // Find the user by their ID
      const user = await User.findById(userId);
  
      // Check if the experience is already in the user's saved items array
      if (user.saved.includes(experienceId)) {
        res.status(400).json({ message: 'Experience is already saved!' });
      } else {
        // Add the experience to the user's saved items array
        user.saved.push(experienceId);
  
        // Save the updated user object to the database
        await user.save();
  
        res.status(200).json({ message: 'Experience saved successfully!' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to save experience.' });
    }
  });


  router.delete('/unsaved', async (req, res) => {
    const userId = req.body.userId;
    const experienceId = req.body.experienceId;

    console.log(userId);
  
    try {
      // Find the user by their ID
      const user = await User.findById(userId);
  
      // Check if the experience is already in the user's saved items array
      if (user.saved.includes(experienceId)) {
        // Remove the experience from the user's saved items array
        user.saved = user.saved.filter(savedExperienceId => savedExperienceId !== experienceId);
  
        // Save the updated user object to the database
        await user.save();
  
        res.status(200).json({ message: 'Experience removed from saved items!' });
      } else {
        res.status(400).json({ message: 'Experience is not in saved items!' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to remove experience from saved items.' });
    }
  });
  
  
  
  
  
  module.exports = router;