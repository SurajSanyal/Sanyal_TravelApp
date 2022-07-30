// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Middleware */
// Configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder (built into 'dist' folder)
app.use(express.static('dist'));

// Setup Server
const port = 3000;
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

