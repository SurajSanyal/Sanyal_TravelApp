import { submitWeatherQuery } from './js/app'

import './styles/style.scss'

alert("I'M ALIVE")
// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', submitWeatherQuery)

export { submitWeatherQuery }