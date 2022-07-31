// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

// Setting up API Keys from dotenv
const dotenv = require('dotenv');
dotenv.config();
const GN_API_KEY = process.env.GN_API_KEY;
const GN_BASE_URL = "http://api.geoNames.org/searchJSON?";
const WB_API_KEY = process.env.WB_API_KEY;
const WB_BASE_URL = "http://api.weatherbit.io/v2.0/current?";
const WBHIST_BASE_URL = "https://api.weatherbit.io/v2.0/history/daily?"

/* Middleware */
// Configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// node-fetch to avoid "fetch is not defined" error
const fetch = require('node-fetch');
// luxon for date processing
const { DateTime } = require("luxon");

// Initialize the main project folder (built into 'dist' folder)
app.use(express.static('dist'));

// Setup Server
const port = 8081;
app.listen(port, () => {
    console.log(`App listening on localhost:${port}`);
})

// Initialize '/all' GET route with a callback function
app.get('/all', (req, res) => {
    res.send(projectData);
})

// Post Route
app.post('/addData', (req, res) => {
    try {
        // body should have temp, date, & user response (content)
        if (!req.body.temp) throw new Error('POST request must include temp!');
        if (!req.body.date) throw new Error('POST request must include date!');
        if (!req.body.content) throw new Error('POST request must include content!');

        projectData.temp = req.body.temp;
        projectData.date = req.body.date;
        projectData.content = req.body.content;

        res.send(projectData);
    } catch (e) {
        console.log(e);
    }
})

/* Function to query Geonames w/ POST */
app.post("/geoNamesData", async (req, res) => {
    const city = req.body.city;
    /* console.log(
        "url = ",
        GN_BASE_URL + "q=" + city + "&maxRows=1&username=" + GN_API_KEY
    ); */
    const url = GN_BASE_URL + "q=" + city + "&maxRows=1&username=" + GN_API_KEY;

    // API request to geoNames
    const cityData = await fetch(url);

    try {
        const response = await cityData.json();

        res.send(response);
    } catch (error) {
        console.log("Error: ", error);
    }
})

/* Function to query WeatherBit */
app.post("/weatherBitData", async (req, res) => {
    let weatherData;

    const lat = req.body.lat;
    const lon = req.body.lon;
    const tripDate = DateTime.fromISO(req.body.date);

    // Check dates:
    const timeDif = tripDate.diff(DateTime.now(), 'weeks').toObject();

    // <=1 wk: return current weather
    if (timeDif.weeks <= 1) {
        // Endpoint construction
        /* console.log(
            "url = ",
            WB_BASE_URL + "lat=" + lat + "&lon=" + lon + "&key=" + WB_API_KEY + "&units=I"
        ); */
        const url = WB_BASE_URL + "lat=" + lat + "&lon=" + lon + "&key=" + WB_API_KEY + "&units=I";

        // API request to WeatherBit
        weatherData = await fetch(url);
    }
    // >=1 wk: return future weather
    else {
        const startDate = tripDate.minus({ years: 1 }).toISODate();
        const endDate = tripDate.minus({ years: 1 }).plus({ days: 1 }).toISODate();

        // Endpoint construction
        /* console.log(
            "url = ",
            WBHIST_BASE_URL + "lat=" + lat + "&lon=" + lon + "&start_date=" + startDate + "&end_date=" + endDate + "&key=" + WB_API_KEY + "&units=I"
        ); */
        const url = WBHIST_BASE_URL + "lat=" + lat + "&lon=" + lon + "&start_date=" + startDate + "&end_date=" + endDate + "&key=" + WB_API_KEY + "&units=I";

        // API request to WeatherBit
        weatherData = await fetch(url);
    }

    try {
        const response = await weatherData.json();
        res.send({
            isCurrent: timeDif.weeks <= 1,
            weatherData: response
        });
    } catch (error) {
        console.log("Error: ", error);
    }
})
