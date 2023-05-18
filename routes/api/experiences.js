const express = require('express');
const router = express.Router();

const Experience = require('../../models/Experience');

require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");
const { response } = require('express');

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
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Given these five tags, give me a query for the Google Maps Places API: ${JSON.stringify(req.query.answers)}. Give it in the format x+y+... and nothing else`
        }
      ]
    });

    const query = response.data.choices[0].message.content;

    const params = {
      query: query,
      location: `${req.query.location.latitude},${req.query.location.longitude}`,
      radius: 450,
      key: process.env.GOOGLE_API_KEY
    };

    const response2 = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params });

    const places = response2.data.results.slice(0, 20).map(place => {
      const addressComponents = place.formatted_address.split(", ");
      const address = {
        street: addressComponents[0],
        city: addressComponents[1],
        state: addressComponents[2].split(" ")[0],
        zip: addressComponents[2].split(" ")[1],
      };
    
      return {
        name: place.name,
        address: address,
        url: place.url,
        image_url: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}` : null
      };
    });
    

    res.json(places);
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