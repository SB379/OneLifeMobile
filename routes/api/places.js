require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI);

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
}, {collection: 'nyc'});

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

// Make request to Places API
axios.get(endpoint, { params })
  .then(response => {
    // Loop through results and store data in database
    response.data.results.forEach(result => {

    const addressComponents = result.formatted_address.split(', ');
      const address = {
        street: addressComponents[0],
        city: addressComponents[1],
        state: addressComponents[2].split(' ')[0],
        zip: addressComponents[2].split(' ')[1]
      };

      const place = new Place({
        name: result.name,
        address: address,
        url: result.website,
        tags: [],
        image_url: "",
        description: "",
      });

      place.save((error) => {
        if (error) {
          console.error(error);
        }
      });
    });
  })
  .catch(error => {
    console.error(error);
  });
