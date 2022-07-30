/* Global Variables */
// Personal API Key for OpenWeatherMap API
const API_KEY = '&appid=ed1efc82a2abe2917dc76cf82ed12e93&units=imperial';
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather?';

/* Function to GET Web API Data */
const getWeather = async (url, zip, key) => {
    const response = await fetch(url + zip + key);

    try {
        const newData = await response.json();
        return newData;
    } catch (e) {
        console.log("error", e);
    }
}

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
    let zip = document.getElementById('zip').value;
    let zipString = "zip=" + zip;

    let feelings = document.getElementById('feelings').value;

    // Calling OpenWeatherMap to retrieve weather for zip code
    getWeather(BASE_URL, zipString, API_KEY)
        .then((res) => {
            let weatherTime = new Date(res.dt * 1000);
            let data = { temp: res.main.temp, date: weatherTime.toDateString(), content: feelings }

            // (Chained) Updating client with retrieved weather
            postData('http://localhost:8081/addData', data).then(() => {
                getAll().then((res) => {
                    document.getElementById('date').innerHTML = res.date;
                    document.getElementById('temp').innerHTML = Math.round(res.temp) + "°F";
                    document.getElementById('content').innerHTML = res.content;
                })
            });
        });
}

export { submitWeatherQuery }