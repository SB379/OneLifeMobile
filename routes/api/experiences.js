const express = require('express');
const router = express.Router();

const Experience = require('../../models/Experience');


//@route GET api/experiences/test
//@description tests experiences route
//@access Public
router.get('/test', (req,res) => res.send('experience route testing'));

//@route GET api/experiences
//@description Get all experiences
//@access Public
router.get('/', (req, res) => {
    Experience.find()
        .then(experiences => res.json(experiences))
        .catch(err => res.status(404).json({noexperiencesfound: "No experiences found"}))
});

// @route GET api/experiences/:id
// @description Get single experience by id
// @access Public
router.get('/:id', (req, res) => {
    Experience.findById(req.params.id)
      .then(experiences => res.json(experiences))
      .catch(err => res.status(404).json({ noexperiencesfound: 'No Experience found' }));
  });

// @route GET api/experiences/:name
// @description Get single experience by name
// @access Public

// router.get('/:name ', (req, res) => {
//   Experience.findOne(req.params.name)
//     .then(experiences => res.json(experiences))
//     .catch(err => res.status(404).json({ noexperiencesfound: 'No Experience found' }));
// });
  
  // @route GET api/experiences
  // @description add/save experiences
  // @access Public
  router.post('/', (req, res) => {
    Experience.create(req.body)
      .then(experiences => res.json({ msg: 'Experience added successfully' }))
      .catch(err => res.status(400).json({ error: 'Unable to add this experience' }));
  });
  
  // @route GET api/experiences/:id
  // @description Update experience
  // @access Public
  router.put('/:id', (req, res) => {
    Experience.findByIdAndUpdate(req.params.id, req.body)
      .then(experiences => res.json({ msg: 'Updated successfully' }))
      .catch(err =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  });
  
  // @route GET api/experiences/:id
  // @description Delete experience by id
  // @access Public
  router.delete('/:id', (req, res) => {
    Experience.findByIdAndRemove(req.params.id, req.body)
      .then(experiences => res.json({ mgs: 'Experience entry deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'No such a experience' }));
  });
  
  module.exports = router;