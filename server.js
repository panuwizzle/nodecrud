'user strict';

const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

// settings
app.set('view engine', 'ejs');

// DB
var db;
MongoClient.connect('mongodb://<user>:<password>@<mlab.com-db-endpoint>', (err, database) => {
    if (err) return console.log(err)
    db = database;
});

// routes
app.get('/', (req, res) => {
    db.collection('quotes').find().toArray((err, result) => {
        if (err) return console.log(err);

        res.render('index.ejs', {quotes: result});
    });
});

app.post('/quotes', (req, res) => {
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err);

        console.log('saved to db');
        res.redirect('/');

    });
});

app.put('/quotes', (req, res) => {
    db.collection('quotes')
        .findOneAndUpdate({name: 'Yoda'}, {
            $set: {
                name: req.body.name,
                quote: req.body.quote
            }
        }, {
            sort: {_id: -1},
            upsert: true
        }, (err, result) => {
            if (err) return res.send(err)
            res.send(result)
        });
});

app.delete('/quotes', (req, res) => {
    db.collection('quotes').findOneAndDelete(
        { name: req.body.name },
        (err, result) => {
            if (err) return res.send(500, err)
            res.send({message: 'A darth vadar quote got deleted'})
        }
    );
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
