/**
 * Name: Daniel Truong
 * Date: 1.17.19
 * FileName: index.js
 */

var express = require('express');
var app = express();
var port = 5500;

app.get('/', function (req, res) {
    res.send("<h3>Hello world</h3>");
});

//Building a server to listen on port 8080
app.listen(port, function () {
    console.log("Server is listening on localhost port:%s", port);
});