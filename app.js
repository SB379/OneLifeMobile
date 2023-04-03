const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

const experiences = require('./routes/api/experiences');
const users = require('./routes/api/users')
const places = require('./routes/api/places')

const app = express();

connectDB();

dotenv.config();

app.use(cors({origin: true, credentials: true}));

app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api/experiences', experiences)
app.use('/api/users', users);
app.use('/api/places', places)

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on ${port}`));