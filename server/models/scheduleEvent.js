/*
 * Schema, model and collection for schedule events
 */

const express = require("express");
const mongoose = require("mongoose");

// Note to self: 'new' keyword is not used in express but used in mongoose
const scheduleEventSchema = new mongoose.Schema({
    title: String,
    color: String,
    start: Date,
    end: Date,
});

// Creates a model and thus map to a COLLECTION in mongoDB
// Returns a db.collection
module.exports = mongoose.model("ScheduleEvent", scheduleEventSchema);
