const express = require('express');
const router = express.Router();

const Experience = require('../../models/Experience');

require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: process.env.GPT_ORG,
  apiKey: process.env.GPT_KEY,
});

const openai = new OpenAIApi(configuration);

//@route GET api/experiences/test
//@description tests experiences route
//@access Public
router.get('/test', (req,res) => res.send('experience route testing'));

//@route GET api/experiences
//@description Get all experiences
//@access Public
router.get('/', async (req, res) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Given these five tags, give me a query for the Google Maps Places API: ${JSON.stringify(req.params.answers)}`
        }
      ]
    });

    res.json(response.data); // Send the response data to the frontend
  } catch (error) {
    console.log("Error from Experiences Screen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// @route GET api/experiences/:id
// @description Get single experience by id
// @access Public
router.get('/:id', (req, res) => {
    Experience.findById(req.params.id)
      .then(experiences => res.json(experiences))
      .catch(err => res.status(404).json({ noexperiencesfound: 'No Experience found' }));
  });

// async function sendPromptToGPT(prompt) {
//   try {
//     const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
//       prompt: prompt,
//       max_tokens: 100,
//       temperature: 0.7,
//       n: 1,
//       stop: '\n',
//     }, {
//       headers: {
//         'Authorization': 'Bearer YOUR_API_KEY',
//         'Content-Type': 'application/json',
//       }
//     });

//     const generatedText = response.data.choices[0].text.trim();
//     return generatedText;
//   } catch (error) {
//     console.error('Error sending prompt to GPT-3.5 API:', error);
//     throw error;
//   }
// }

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