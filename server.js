
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Check your .env file.");
}

const client = new MongoClient(process.env.MONGO_URI);

let moviesCollection;

// CREATE - Add a new movie
app.post("/api/movies", async (req, res) => {
    try {
        const { title, director, year, genre } = req.body;

        if (!title || !director || !genre || !Number.isInteger(year)) {
            return res.status(400).json({
                error: "Please provide valid movie details."
            });
        }

        const movie = {
            title,
            director,
            year,
            genre
        };

        const result = await moviesCollection.insertOne(movie);

        res.status(201).json({
            message: "Movie added successfully",
            movieId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Get all movies
app.get("/api/movies", async (req, res) => {
    try {
        const movies = await moviesCollection
            .find({})
            .sort({ _id: -1 })
            .toArray();

        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Update a movie
app.put("/api/movies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid movie ID" });
        }

        const { title, director, year, genre } = req.body;

        if (!title || !director || !genre || !Number.isInteger(year)) {
            return res.status(400).json({
                error: "Please provide valid movie details."
            });
        }

        const result = await moviesCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: { title, director, year, genre }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json({ message: "Movie updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Delete a movie
app.delete("/api/movies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid movie ID" });
        }

        const result = await moviesCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json({ message: "Movie deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to MongoDB Atlas and start server
async function startServer() {
    try {
        await client.connect();

        console.log("MongoDB Atlas connected successfully!");

        const db = client.db("MoviesDB");
        moviesCollection = db.collection("Movies");

        console.log("Movies database and collection selected!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
