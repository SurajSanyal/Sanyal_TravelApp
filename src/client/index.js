import { submitWeatherQuery, submitCityQuery } from './js/app'

import './styles/style.scss'

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', submitCityQuery)

export { submitWeatherQuery, submitCityQuery }