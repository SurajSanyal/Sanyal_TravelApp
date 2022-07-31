/* Global Variables */
// Personal API Key for OpenWeatherMap API
const API_KEY = '&appid=ed1efc82a2abe2917dc76cf82ed12e93&units=imperial';
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather?';

/* Function to POST data */
const postData = async (url = '', data = {}) => {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        // Body data type must match "Content-Type" header        
        body: JSON.stringify(data),
    });

    try {
        const newData = await response.json();
        return newData;
    } catch (e) {
        console.log("error", e);
    }
}

/* Function to GET Project Data from server */
const getAll = async () => {
    const response = await fetch('http://localhost:8081/all');

    try {
        const newData = await response.json();
        return newData;
    } catch (e) {
        console.log("error", e);
    }
}

/* Function called by event listener */
async function submitWeatherQuery() {
    // Determine 
    let zip = document.getElementById('zip').value;
    let zipString = "zip=" + zip;

    let feelings = document.getElementById('feelings').value;

    // Calling OpenWeatherMap to retrieve weather for zip code
    // @todo: replace with call to server
    getWeather(BASE_URL, zipString, API_KEY)
        .then((res) => {
            let weatherTime = new Date(res.dt * 1000);
            let data = { temp: res.main.temp, date: weatherTime.toDateString(), content: feelings }
        });
}

/* Function called by event listener */
async function submitCityQuery() {
    const data = { city: document.getElementById('city').value }

    // Getting city data from GeoNames
    postData('http://localhost:8081/geoNamesData', data).then((res) => {
        // console.log(res.geonames[0]);
        // Check for returned city
        if (!res.totalResultsCount) {
            throw "No City result found -- check for invalid 'city' input";
        }

        const cityData = res.geonames[0];
        const weatherQueryData = {
            lat: cityData.lat,
            lon: cityData.lng,
            date: document.getElementById('date').value,
        }

        // Get city weather data from Weatherbit
        postData('http://localhost:8081/weatherBitData', weatherQueryData).then((res) => {
            const weatherInfo = res.weatherData.data[0];

            if (res.isCurrent) {
                console.log(`Current Weather: ${weatherInfo.weather.description}`)
                console.log(`Current Temp: ${weatherInfo.temp}F`)
                console.log(`Feels Like: ${weatherInfo.app_temp}F`)
            } else {
                console.log(`High: ${weatherInfo.max_temp}F`)
                console.log(`Low: ${weatherInfo.min_temp}F`)
            }

        })


        // Update projectData (w/ '/addData' endpoint) & UI
        /* 
        // (Chained) Updating client with retrieved weather
            postData('http://localhost:8081/addData', data).then(() => {
                getAll().then((res) => {
                    document.getElementById('date').innerHTML = res.date;
                    document.getElementById('temp').innerHTML = Math.round(res.temp) + "°F";
                    document.getElementById('content').innerHTML = res.content;
                })
            });
        */

        // @todo: refactor with Promise.all for weather vs pixabay
        // https://stackoverflow.com/a/59664248
    })
};

export { submitWeatherQuery, submitCityQuery }