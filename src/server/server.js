// Setup empty JS object to act as endpoint for all routes
let projectData = {
    trips: []
};

// Require Express to run server and routes
const express = require('express');
const app = express();

// Setting up API Keys from dotenv
const dotenv = require('dotenv');
dotenv.config();
const GN_API_KEY = process.env.GN_API_KEY;
const GN_BASE_URL = "http://api.geoNames.org/searchJSON?";
const WB_API_KEY = process.env.WB_API_KEY;
const WB_BASE_URL = "http://api.weatherbit.io/v2.0/current?";
const WBHIST_BASE_URL = "https://api.weatherbit.io/v2.0/history/daily?"
const PB_API_KEY = process.env.PB_API_KEY;
const PB_BASE_URL = "https://pixabay.com/api/?";

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

// Initialize '/all' GET route with a callback function
app.get('/all', (req, res) => {
    res.status(200).send(projectData);
})

// Post Route
app.post('/addData', (req, res) => {
    try {
        let updateData = {}
        const tripData = req.body;

        // All trips should have city, dates, URL & isTripSoon
        if (!tripData.url) throw new Error('POST request must include picture URL!')
        updateData.url = tripData.url;

        if (!tripData.start) throw new Error('POST request must include start date!')
        updateData.start = tripData.start;

        if (!tripData.end) throw new Error('POST request must include end date!')
        updateData.end = tripData.end;

        // Construct duration string
        const startDate = DateTime.fromISO(updateData.start);
        const endDate = DateTime.fromISO(updateData.end);

        const durationObj = endDate.diff(startDate, ["years", "months", "days"]).plus({ days: 1 });

        let durationString = '';
        if (durationObj.values.years) {
            durationString += `${durationObj.values.years} year`;
            if (durationObj.values.years > 1) durationString += 's'
        }
        if (durationObj.values.months) {
            durationString += ` ${durationObj.values.months} month`;
            if (durationObj.values.months > 1) durationString += 's'
        }
        if (durationObj.values.days) {
            durationString += ` ${durationObj.values.days} day`;
            if (durationObj.values.days > 1) durationString += 's'
        }

        updateData.duration = durationString;

        if (!tripData.city) throw new Error('POST request must include picture city!')
        updateData.city = tripData.city;

        if (tripData.isTripSoon == undefined) throw new Error('POST request must include isTripSoon!')
        updateData.isTripSoon = tripData.isTripSoon;

        // Check temps depending on current/future trip
        if (tripData.isTripSoon) {
            // Recent trips should have weather, current temp & "feels like" temp
            if (!tripData.app_temp) throw new Error('POST request must include app temp!')
            if (!tripData.temp) throw new Error('POST request must include current temp!')
            if (!tripData.weather) throw new Error('POST request must include current weather description!')

            updateData.app_temp = tripData.app_temp;
            updateData.temp = tripData.temp;
            updateData.weather = tripData.weather;
        }
        else {
            // Future trips should have high & low temps
            if (!tripData.max_temp) throw new Error('POST request must include max temp!')
            if (!tripData.min_temp) throw new Error('POST request must include min temp!')

            updateData.max_temp = tripData.max_temp;
            updateData.min_temp = tripData.min_temp;
        }

        projectData.trips.push(updateData);
        res.send(projectData);
    } catch (e) {
        console.log(e);
    }
})

/* Function to query Geonames w/ POST */
app.post("/geoNamesData", async (req, res) => {
    const city = req.body.city;
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

/* Function to query Pixabay w/ POST */
app.post("/pixabayData", async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const url = PB_BASE_URL + "q=" + searchTerm + "&image_type=photo&category=travel&safesearch=true&page=1&per_page=3&key=" + PB_API_KEY;

    // API request to Pixabay
    const picData = await fetch(url);

    try {
        const response = await picData.json();
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
        const url = WB_BASE_URL + "lat=" + lat + "&lon=" + lon + "&key=" + WB_API_KEY + "&units=I";

        // API request to WeatherBit
        weatherData = await fetch(url);
    }
    // >=1 wk: return future weather
    else {
        const startDate = tripDate.minus({ years: 1 }).toISODate();
        const endDate = tripDate.minus({ years: 1 }).plus({ days: 1 }).toISODate();

        // Endpoint construction
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

module.exports = app;