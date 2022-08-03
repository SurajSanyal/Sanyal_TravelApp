import { submitCityQuery } from "../src/client/js/app";

describe("Testing the submit functionality", function () {
    test("Testing the submitCityQuery() function", function () {
        expect(submitCityQuery).toBeDefined();
    });
});