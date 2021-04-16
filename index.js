const express = require('express');
const Datastore = require('nedb');
const app = express();

var new_id;

app.listen(process.env.PORT || 3000, () => console.log('Listening at 3000.'));
app.use(express.static('public'));
app.use(express.json( {limit: '1mb'} ));

// Family Schedule

const scheduleDB = new Datastore('schedule.db');
scheduleDB.loadDatabase();

app.post('/schedule/init', (request, response) => {
    console.log('Initiating/Refreshing Schedule');
    scheduleDB.find({}, (err, docs) => {
        response.json(docs);
    });
});

app.post('/schedule/add', (request, response) => {
    console.log('[POST add] Event added:');
    console.log(request.body);
    scheduleDB.insert(request.body, (err, newDoc) => {
        scheduleDB.update(
            { _id: newDoc._id },
            { $set: { "extendedProps.eid": newDoc._id } }, {});
        response.json({ eid: newDoc._id });
    });
});

app.post('/schedule/edit', (request, response) => {
    console.log('[POST edit] Event edited:');
    const editData = request.body;
    console.log(editData);
    scheduleDB.update(
        { _id: editData.extendedProps.eid },
        { $set: { title: editData.title, color: editData.color, "extendedProps.colorLabel": editData.extendedProps.colorLabel } }, {});
    response.end();
});

app.post('/schedule/move-resize', (request, response) => {
    console.log('[POST edit] Event moved or resized:');
    const moveData = request.body;
    console.log(moveData);
    scheduleDB.update(
        { _id: moveData.extendedProps.eid },
        { $set: { start: moveData.start, end: moveData.end } }, {});
    response.end();
});

app.post('/schedule/delete', (request, response) => {
    console.log('[POST delete] Event deleted:');
    const deleteData = request.body;
    console.log(deleteData);
    scheduleDB.remove( { _id: deleteData.eid }, {} );
    response.end();
});

// To-do List

const pwDB = new Datastore('pw.db');
pwDB.loadDatabase();

app.get('/todo/init', (request, response) => {
    console.log('Initiating/Refreshing To-do List');
    var hasAcc = false;
    var hasLoggedIn = false;
    checkInit = (docs) => {
        if(docs.length){
            hasAcc = true;
            if(docs[0].hasLoggedIn){
                hasLoggedIn = true;
            }
        }
        response.json({hasAcc: hasAcc, hasLoggedIn: hasLoggedIn});
    }
    pwDB.find({}, (err, docs) => {
        checkInit(docs);
    });
});

app.post('/todo/create-pw', (request, response) => {
    console.log('Creating Account');
    pwDB.find({}, (err, docs) => {
        if(docs.length){
            console.log('There already exists one parent account.')
        } else {
            pwDB.insert(request.body);
        }
    });
    response.end();
});

app.post('/todo/login', (request, response) => {
    console.log('Logging in');
    pwDB.find({pw: request.body.pw}, (err, docs) => {
        if(docs.length){
            pwDB.update({ pw: request.body.pw }, { $set: { hasLoggedIn: true } }, {});
            response.json({success: true});
        } else {
            response.json({success: false});
        }
    });
})

app.get('/todo/logout', (request, response) => {
    console.log('Logging out');
    pwDB.update({}, { $set: { hasLoggedIn: false  } }, {});
    response.end();
});

const todoDB = new Datastore('todo.db');
todoDB.loadDatabase();

app.get('/todo/load', (request, response) => {
    console.log('Loading tasks');
    todoDB.find({}, (err, docs) => {
        response.json(docs);
    })
});

app.post('/todo/add', (request, response) => {
    console.log('Adding task to to-do list');
    todoDB.insert(request.body, (err, doc) => {
        response.json({ id : doc._id });
    });
});

app.post('/todo/edit', (request, response) => {
    console.log('Editing task: ');
    console.log(request.body);
    todoDB.update({ _id: request.body._id },
    { $set: { name: request.body.name, pic: request.body.pic } }, {});
    response.end();
});

app.post('/todo/delete', (request, response) => {
    console.log('Deleting task');
    todoDB.remove( { _id: request.body._id }, {} );
    response.end();
});

app.post('/todo/check', (request, response) => {
    console.log('Toggling checkbox for task');
    console.log(request.body);
    todoDB.update( { _id: request.body._id },
    { $set: { checked: request.body.checked } }, {} );
    response.end();
})
