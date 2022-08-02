import { submitCityQuery } from './js/app'
import { validateDate, validateDateRange } from './js/dateValidator'

import './styles/style.scss'

// Event listener to add function to existing HTML DOM elements
document.getElementById('generate').addEventListener('click', submitCityQuery)
document.getElementById('start').addEventListener('change', validateDate)
document.getElementById('end').addEventListener('change', validateDateRange)


export { validateDate, submitCityQuery }