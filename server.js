
const express = require("express");

const app = express();

app.use(express.static("public"));

app.get("/api/movies", (req, res) => {
    res.json([]);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Website running on port ${PORT}`);
});
