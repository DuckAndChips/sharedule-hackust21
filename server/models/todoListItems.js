/*
 * Schema, model and collection for todo list items
 */

const express = require('express');
const mongoose = require('mongoose');

const TodoListSchema = new mongoose.Schema({
    name: String,
    pic: String,
    checked: Boolean
});

module.exports = mongoose.model('todolist', TodoListSchema);