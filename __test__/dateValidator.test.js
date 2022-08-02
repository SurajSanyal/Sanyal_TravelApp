// Import the js file to test
import { validateDate } from "../src/client/js/dateValidator"

// Test suite for dateValidator.js
describe("Testing dateValidator.js", () => {
    // The test() function has two arguments - a string description, and an actual test as a callback function.  
    test("Testing validation of VALID Date", () => {
        const validInput = "2023-12-12";
        const res = validateUrl(validInput);
        expect(res).toBeTruthy();
    });

    test("Testing rejection of INVALID DATE 1", () => {
        const invalidInput = "2020-12-12";
        const res = validateUrl(invalidInput);
        expect(res).toBeFalsy();
    });

    test("Testing rejection of INVALID DATE 2", () => {
        const invalidInput = "2asdfasdf";
        const res = validateUrl(invalidInput);
        expect(res).toBeFalsy();
    });
});