/**
 * Name: Daniel Truong
 * Date: 1.17.19
 * FileName: index.js
 */

var express = require('express');
var app = express();
var config = require('./config.json'); //Including the JSON file
var url = require('url');

//The "app.use" need a function. The require('cookie-parser') fills in for the function, and the () after are needed for parameteres. 
app.use(require('cookie-parser')());

app.get('/', function (req, res) {
    res.send("<h3>Hello world</h3>"); //Sends the message in a h3
});

//Building a server to listen on port 8080
app.listen(config.port, function () {
    console.log("Server is listening on localhost port:%s", config.port);
});