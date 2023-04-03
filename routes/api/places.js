require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

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

async function runScript() {
    // Make request to Places API
    let pageToken = "";
    let numSaved = 0;
    while (numSaved < 20) {
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
  
        // const photo = result.photos && result.photos.length > 0 ? result.photos[0].getUrl({ maxWidth: 800, maxHeight: 800 }) : "";
        // const photo = result.photos && result.photos.length > 0 && result.photos[0].getUrl ? result.photos[0].getUrl({ maxWidth: 800, maxHeight: 800 }) : "";
        // const photo = result.photos && result.photos.length > 0 ? result.photos[0].getUrl({ maxWidth: 800, maxHeight: 800 }) : "";
        const photo = result.photos && result.photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${result.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}` : "";
        
        const description = result.description || "";


        const place = new Place({
          name: result.name,
          address: address,
          url: result.website,
          tags: [],
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
  
        if (numSaved === 20) {
          break;
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
  
runScript();
  
module.exports = router;
