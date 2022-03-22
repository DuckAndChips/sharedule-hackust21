/*
 * Router that processes CRUD operations regarding todo list.
 */

// Note to self: 'new' keyword is not used in express but used in mongoose
const express = require("express");
var router = express.Router();
const TodoListItem = require("../models/todoListItems.js");

router.get("/init", (request, response) => {
    response.status(200).json({ hasAcc: process.env.TODO_PW ? true : false });
});

router.post("/create-pw", async (request, response) => {
    process.env.TODO_PW = request.body.pw;
    response.status(200).json({});
});

router.post("/login", (request, response) => {
    response.status(200).json({
        success: process.env.TODO_PW == request.body.pw ? true : false,
    });
});

router.get("/load", async (request, response) => {
    try {
        const items = await TodoListItem.find();
        response.status(200).json(items);
    } catch (err) {
        response.status(500).json({ message: err });
    }
});

router.post("/add", async (request, response) => {
    const item = new TodoListItem({
        name: request.body.name,
        pic: request.body.pic,
        checked: request.body.checked,
    });
    try {
        const newItem = await item.save();
        response.status(201).json(newItem);
    } catch (err) {
        response.status(500).json({ message: err });
    }
});

router.post("/check", async (request, response) => {
    try {
        await TodoListItem.findOneAndUpdate(
            { _id: request.body._id },
            [{ $set: { checked: { $not: "$checked" } } }]
            //{ checked: !checked }
        );
        response.status(200).json({});
    } catch (err) {
        response.status(500).json({ message: err });
    }
});

router.post("/edit", async (request, response) => {
    try {
        await TodoListItem.updateOne(
            { _id: request.body._id },
            { name: request.body.name, pic: request.body.pic }
        );
        response.status(200).json({});
    } catch (err) {
        response.status(500).json({ message: err });
    }
});

router.post("/delete", async (request, response) => {
    try {
        await TodoListItem.deleteOne({ _id: request.body._id });
        response.status(200).json({});
    } catch (err) {
        response.status(500).json({});
    }
});

module.exports = router;
