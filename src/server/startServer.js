const app = require("./server");
// Setup Server
const port = 8081;
app.listen(port, () => {
    console.log(`App listening on localhost:${port}`);
})
