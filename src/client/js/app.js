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

async function updateApp(data) {
    postData('http://localhost:8081/addData', data).then(() => {
        getAll().then((res) => {
            // console.log(res)
            const tripData = res.trips[res.trips.length - 1];

            // Update UI
            let cardHTML =
                `<div class="card">
                <img class="trip-image" src=${tripData.url}>
                <div class="trip-info">
                    <div class="city-desc">Your Trip to: ${tripData.city}</div>
                    <div class="date-desc">Departing: ${tripData.start}</div>
                    <div class="date-desc">Duration: ${tripData.duration}</div>`;

            if (data.isTripSoon) {
                cardHTML += `
                    <div class="weather-desc">Current Weather: ${tripData.weather}</div>
                    <div class="weather-temp">Current Temp: ${tripData.temp}F</div>
                    <div class="weather-feel">Feels Like: ${tripData.app_temp}F</div>

                </div>
                </div>`;
            } else {
                cardHTML += `
                    <div class="weather-high">Usual High: ${tripData.max_temp}F</div>
                    <div class="weather-low">Usual Low: ${tripData.min_temp}F</div>
                    </div>
                </div>` ;
            }


            document.getElementById("cards").insertAdjacentHTML('beforeend', cardHTML)
        })
    });
}

/* Function called by event listener */
async function submitCityQuery() {
    let data = {};
    data.start = document.getElementById('start').value;
    data.end = document.getElementById('end').value;

    const cityNameObj = { city: document.getElementById('city').value }
    if (cityNameObj.city == '') {
        document.getElementById('error-message').innerHTML = "Please input a city!";
        throw "No City input -- check for invalid 'city' input";
    }

    // Getting city data from GeoNames
    postData('http://localhost:8081/geoNamesData', cityNameObj).then((res) => {
        // console.log(res.geonames[0]);
        // Check for returned city
        if (!res.totalResultsCount) {
            throw "No City result found -- check for invalid 'city' input";
        }

        const cityData = res.geonames[0];
        data.city = cityData.toponymName;

        const picQueryData = {
            searchTerm: cityData.toponymName
        }

        const weatherQueryData = {
            lat: cityData.lat,
            lon: cityData.lng,
            date: document.getElementById('start').value,
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
                picUrl = picRes.hits[0].webformatURL;
            }

            // console.log(`Picture URL: ${picUrl}`);
            data.url = picUrl;

            // Process weather result
            const weatherInfo = weatherRes.weatherData.data[0];

            data.isTripSoon = weatherRes.isCurrent;
            if (weatherRes.isCurrent) {
                /* console.log(`Current Weather: ${weatherInfo.weather.description}`)
                console.log(`Current Temp: ${weatherInfo.temp}F`)
                console.log(`Feels Like: ${weatherInfo.app_temp}F`) */

                data.weather = weatherInfo.weather.description;
                data.temp = weatherInfo.temp;
                data.app_temp = weatherInfo.app_temp;
            } else {
                /* console.log(`High: ${weatherInfo.max_temp}F`)
                console.log(`Low: ${weatherInfo.min_temp}F`) */

                data.max_temp = weatherInfo.max_temp;
                data.min_temp = weatherInfo.min_temp;
            }


            // Update projectData (w/ '/addData' endpoint) & UI
            // console.log(data);
            updateApp(data);
        });

    })
};

export { submitCityQuery }