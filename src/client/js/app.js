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

// @todo: implement UI update
async function updateApp(data) {
    postData('http://localhost:8081/addData', data).then(() => {
        getAll().then((res) => {
            console.log(res)
            /*  document.getElementById('date').innerHTML = res.date;
             document.getElementById('temp').innerHTML = Math.round(res.temp) + "°F";
             document.getElementById('content').innerHTML = res.content; */
        })
    });
}

/* Function called by event listener */
async function submitCityQuery() {
    let data = {};
    const cityNameObj = { city: document.getElementById('city').value }

    // Getting city data from GeoNames
    postData('http://localhost:8081/geoNamesData', cityNameObj).then((res) => {
        // console.log(res.geonames[0]);
        // Check for returned city
        if (!res.totalResultsCount) {
            throw "No City result found -- check for invalid 'city' input";
        }

        const cityData = res.geonames[0];

        const picQueryData = {
            searchTerm: cityData.toponymName
        }

        const weatherQueryData = {
            lat: cityData.lat,
            lon: cityData.lng,
            date: document.getElementById('date').value,
        }

        // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        Promise.all([postData('http://localhost:8081/pixabayData', picQueryData),
        postData('http://localhost:8081/weatherBitData', weatherQueryData)]).then((values) => {
            const picRes = values[0];
            const weatherRes = values[1];

            // Process Pixabay result
            let picUrl;
            if (!picRes.totalHits) {
                picUrl = "https://placeimg.com/640/480/nature";
            } else {
                picUrl = picRes.hits[0].pageURL;
            }

            console.log(`Picture URL: ${picUrl}`);
            data.url = picUrl;

            // Process weather result
            const weatherInfo = weatherRes.weatherData.data[0];

            data.isTripSoon = weatherRes.isCurrent;
            if (weatherRes.isCurrent) {
                console.log(`Current Weather: ${weatherInfo.weather.description}`)
                console.log(`Current Temp: ${weatherInfo.temp}F`)
                console.log(`Feels Like: ${weatherInfo.app_temp}F`)

                data.weather = weatherInfo.weather.description;
                data.temp = weatherInfo.temp;
                data.app_temp = weatherInfo.app_temp;
            } else {
                console.log(`High: ${weatherInfo.max_temp}F`)
                console.log(`Low: ${weatherInfo.min_temp}F`)

                data.max_temp = weatherInfo.max_temp;
                data.min_temp = weatherInfo.min_temp;
            }


            // Update projectData (w/ '/addData' endpoint) & UI
            console.log(data);
            updateApp(data);
        });

    })
};

export { submitCityQuery }