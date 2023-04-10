require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const openai = require('openai');
const { promisify } = require('util');

console.log("trying to connect")

// Connect to MongoDB database
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI);

console.log("This connected");

// Define schema for Place model
const placeSchema = new mongoose.Schema({
  name: String,
  address: [{
    street: String,
    city: String,
    state: String,
    zip: String,
  }],
  url: String,
  tags: [],
  image_url: String,
  description: String,
}, {collection: 'experiences'});

// Create Place model
const Place = mongoose.model('Place', placeSchema);

// Define API endpoint and search parameters
const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const params = {
  query: 'restaurants',
  location: '40.7128,-74.0060', // New York City
  radius: 10000,
  key: process.env.GOOGLE_API_KEY
};

const client = new openai.OpenAIApi({
    apiKey: process.env.GPT_KEY,
    engine: 'gpt-3.5-turbo',
    maxTokens: 5,
    temperature: 0.5,
  });

  async function runScript() {
    // Make request to Places API
    let pageToken = "";
    let numSaved = 0;
    while (numSaved < 500) {
      const response = await axios.get(endpoint, { params: { ...params, pagetoken: pageToken } });
  
      // Loop through results and store data in database
      for (const result of response.data.results) {
        const existingPlace = await Place.findOne({ name: result.name }).exec();
  
        if (existingPlace) {
          console.log(`Place '${result.name}' already exists in database.`);
          continue;
        }
  
        const addressComponents = result.formatted_address.split(", ");
        const address = {
          street: addressComponents[0],
          city: addressComponents[1],
          state: addressComponents[2].split(" ")[0],
          zip: addressComponents[2].split(" ")[1],
        };
  
        const photo = result.photos && result.photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${result.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}` : "";
  
        // Call GPT-3.5 API to generate tags
        const tags = await generateTags(result.name);
  
        // Call GPT-3.5 API to generate description
        const description = await generateDescription(result.reviews.slice(0, 5));
  
        const place = new Place({
          name: result.name,
          address: address,
          url: result.website,
          tags: tags,
          image_url: photo,
          description: description,
        });
  
        try {
          await place.save();
          console.log(`Place '${result.name}' added to database.`);
          numSaved++;
        } catch (error) {
          console.error(error);
        }
      }
  
      if (!response.data.next_page_token) {
        console.log("No more pages to fetch");
        break;
      }
  
      pageToken = response.data.next_page_token;
    }
  
    console.log("Finished adding Experiences");
  }
  
  
  // Function to generate tags using GPT-3.5 API
  async function generateTags(text) {
    try {
      const response = await client.complete({
        prompt: `Generate 5 tags for the following text: ${text}`,
      });
  
      // Extract the generated tags from the API response
      const tags = response.choices[0].text.trim().split('\n');
      
      return tags;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  // Function to generate description using GPT-3.5 API
  const generateDescription = async (reviews) => {
    // construct prompt using reviews
    const prompt = `Please write a brief description of this place based on the following reviews:\n\n${reviews.slice(0, 5).map(r => `"${r.text}"`).join('\n')}\n\nDescription:`;

    try {
        // generate description using GPT-3.5 API
        const response = await client.complete({
        engine: 'gpt-3.5-turbo',
        prompt,
        maxTokens: 128,
        temperature: 0.7,
        n: 1,
        stop: '.'
        });
        
        // extract and return generated description from response
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error(`Error generating description: ${error}`);
        return "";
    }
  } 

  runScript();
  
module.exports = router;
