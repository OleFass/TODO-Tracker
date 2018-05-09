// EXPRESS
var express = require('express');
var app = express();
app.use(express.static(__dirname));

// parse application/x-www-form-urlencoded
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// set environment variable to override port
app.set('port', process.env.PORT || 3000);

// HANDELBARS
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// MONGODB
var mongoose = require('mongoose');
// mongodb://<username>:<password>@ds117200.mlab.com:17200/todos
const url = 'mongodb://user01:palpebralfissures@ds117200.mlab.com:17200/todos';
mongoose.connect(url, (err) => {
    if(err) console.log(err);
    console.log("connected to DB")
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// DB MODEL
// a schema represents a collection and defines the shape of a document in that collection
var Schema = mongoose.Schema;
var todoSchema = new Schema({
    _id: String,
    description: String,
    deadline: { type: Date, default: Date.now },
    progress: Number
});
// convert schema to model. instances of models are documents
var todoModel = mongoose.model('ToDo', todoSchema);

// root page
app.get('/', function(req, res) {
    res.render('home', {title: 'Create TODO'});
});

/*
create new to-do if it doesnt exists
*/
app.post('/addTODO', (req, res) => {

    //console.log(req.body._id = req.body.description);
    var todo = new todoModel(req.body);
    todo._id = todo.description;
    //console.log(JSON.stringify(todo));

    // insert document only if to-do doesnt exist
    todo.save((err, todo) => {
        if (err) {
            if(err.code === 11000) {
                console.log("TODO already exists");
            } else console.log(err);
        } else {
            console.log("saved : " + JSON.stringify(todo));
        }
    });

    // update if document is in DB else save new document
    /*
    todoModel.findOneAndUpdate(req.body, req.body, {upsert: true}, function (err, doc) {
        if (err) {
            console.error(err.stack);
        } else {
            console.log("saved in DB");
        }
    });*/

    // FOR TESTING: iterate over all documents and print them
    /*todoModel.find({}, (err, todo) => {
        if(err) console.log(err);
        console.log("Show all documents in DB:");
        todo.map((todo) => {
            console.log(JSON.stringify(todo));
        });
    });*/

    res.redirect('/');
})

/**/
app.post("/editTODO", (req, res, next) => {
    console.log(req.body);
    res.redirect('/listTODO');
});

/**/
app.post("/deleteTODO", (req, res, next) => {
    console.log(req.body);
    res.redirect('/listTODO');
});

/*
*
* */
app.get("/listTODO", (req, res, next) => {

    todoModel.find({}, (err, todo) => {
        if(err) console.log(err);

        var todos = todo.map((todo) => {
            return todo;
        });
        res.render('list', {title: 'List TODOs', todos: todos});
    });
});
/*
*
* */
app.get("/imprint", (req, res) => {
    //res.status(200);
    res.render('imprint', {title: 'Imprint'});
});

// 404 catch-all handler (middleware)
app.use((req, res, next) => {
    res.status(404);
    res.render('404', {title: '404'});
})

// 500 error handler (middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500', {title: '500'});
})

//
app.listen(app.get('port'), () => {
    console.log( 'Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate...' );
})