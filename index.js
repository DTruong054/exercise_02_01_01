/**
 * Name: Daniel Truong
 * Date: 1.17.19
 * FileName: index.js
 */

var express = require('express');
var app = express();
var auth = require('./auth.js');
var config = require('./config.json'); //Including the JSON file
var url = require('url');

//The "app.use" need a function. The require('cookie-parser') fills in for the function, and the () after are needed for parameteres. 
app.use(require('cookie-parser')());

app.get('/', function (req, res) {
    res.send("<h3>Hello world</h3>"); //Sends the message in a h3
});

// app.get('/auth/twitter', function (req, res) {
//     res.send("<h3>Hello I am a oauth callback</h3>"); //This will send once the page says /auth/twitter
// })

app.get('/auth/twitter', auth.redirectLogin); //auth is the file, redirectLogin is the thing being exported from the file

//Building a server to listen on port 8080
app.listen(config.port, function () {
    console.log("Server is listening on localhost port:%s", config.port);
});