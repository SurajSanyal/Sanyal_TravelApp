const app = require("../src/server/server");
const request = require("supertest");

// Test suite for server.js
describe("Testing GET /all", () => {
    // The test() function has two arguments - a string description, and an actual test as a callback function.  
    test("Testing response for GET /all", async () => {
        const response = await request(app).get("/all");
        expect(response.statusCode).toBe(200);
    })
});