// Import the js file to test
import { validateDate, validateDateRange } from "../src/client/js/dateValidator"

// Test suite for dateValidator.js
describe("Testing dateValidator.js", () => {
    // The test() function has two arguments - a string description, and an actual test as a callback function.  
    test("Testing that validateDate exists", () => {
        // No inputs expected, just checking for validateDate()
        expect(validateDate).toBeDefined();
    })

    test("Testing that validateDateRange exists", () => {
        // No inputs expected, just checking for validateDateRange()
        expect(validateDateRange).toBeDefined();
    })
});