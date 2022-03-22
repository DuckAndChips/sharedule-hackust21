/*
 * Router that processes CRUD operations regarding schedule.
 */

// Note to self: 'new' keyword is not used in express but used in mongoose
const express = require("express");
const router = express.Router();
const ScheduleEvent = require("../models/scheduleEvent");

// Aggregation pipeline for replacing field name '_id' with 'id'
// to fit the FullCalendar Event schema in refetching
const replaceIDPipeline = [
    {
        $addFields: {
            id: "$_id",
        },
    },
    {
        $project: {
            _id: 0,
            __v: 0,
        },
    },
];

// Return all events from the database
router.get("/init", async (request, response) => {
    try {
        // Attempts to retreive all events from the database
        // console.log("Initializing/Refreshing Schedule");
        const events = await ScheduleEvent.aggregate(replaceIDPipeline); // Replace '_id' with 'id'
        response.status(200).json(events); // 200: OK
    } catch (err) {
        response.status(500).json({ message: err }); // 500: Internal Server Error
    }
});

// Add a new event to the database
router.post("/add", async (request, response) => {
    // Create new event using the schema
    const event = new ScheduleEvent({
        title: request.body.title,
        color: request.body.color,
        start: request.body.start,
        end: request.body.end,
    });
    try {
        // Attempts to save the new event into database
        const newEvent = await event.save();
        console.log(`Event added: ${request.body.title}`);
        response.status(201).json(newEvent); // 201: Created
    } catch (err) {
        response.status(400).json({ message: err }); // 400: Bad Request
    }
});

// Edit an event's title and color and save it to the database
router.post("/edit", async (request, response) => {
    try {
        const newEvent = await ScheduleEvent.updateOne(
            { _id: request.body.id },
            { title: request.body.title, color: request.body.color }
        );
        console.log(`Event edited: ${request.body.title}`);
        response.status(200); // 200: OK
    } catch (err) {
        response.status(500).json({ message: err }); // 500: Internal Server Error
    }
});

// Edit an event's start and end time and save it to the database
router.post("/move-resize", async (request, response) => {
    try {
        const newEvent = await ScheduleEvent.updateOne(
            { _id: request.body.id },
            { start: request.body.start, end: request.body.end }
        );
        console.log(`Event edited: ${request.body.id}`);
        response.status(200); // 200: OK
    } catch (err) {
        response.status(500).json({ message: err }); // 500: Internal Server Error
    }
});

// Delete an event
router.post("/delete", async (request, response) => {
    try {
        const newEvent = await ScheduleEvent.deleteOne({ _id: request.body.id });
        console.log(`Event deleted: ${request.body.id}`);
        response.status(200); // 200: OK
    } catch (err) {
        response.status(500).json({ message: err }); // 500: Internal Server Error
    }
});



module.exports = router;
