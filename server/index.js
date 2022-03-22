/*
 * Express server that acts as a web server and also a backend.
 * Uses mongoDB Atlas to handle CRUD operations of schedule, to-do list and to-do list password.
 */

require("dotenv").config({path: `${__dirname}/.env`}); // Allows the use of .env files for env vars
const express = require("express");
const mongoose = require("mongoose"); // Easier and schema-based mongoDB management

// Create express instance
const app = express();

// Listen at 3000 or the port provided as env var
var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Listening at " + port);
});

// Connect to mongoDB database
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => {
    console.error(err);
});
db.once("open", () => {
    console.log("Connected to database.");
});

// Use json middleware for incoming requests
app.use(express.json());

// Set up router middlewares
const scheduleRouter = require(`./routers/schedules.js`);
app.use('/schedule', scheduleRouter);
const todoListRouter = require(`./routers/todos.js`);
app.use('/todo', todoListRouter);

// Also acts as web server and allow users to GET static content in client folder
app.use(express.static("client"));