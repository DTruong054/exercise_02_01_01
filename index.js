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
var queryString = require('querystring');

//The "app.use" need a function. The require('cookie-parser') fills in for the function, and the () after are needed for parameteres. 
app.use(require('cookie-parser')());

app.get('/', function (req, res) {
    res.send("<h3>Hello world</h3>"); //Sends the message in a h3
});

app.get('/auth/twitter', auth.redirectLogin); //auth is the file, redirectLogin is the thing being exported from the file

app.get('/tweet', function (req, res) {
    var credentials = auth.getCredentials();
    if (!credentials.access_token || !credentials.access_token_secret) {
        return res.send(418);
    }
    var url = "https://api.twitter.com/1.1/statuses/update.json";
    auth.post(url, credentials.access_token, credentials.access_token_secret, {
        //Body has to be a JSON object
        status: "I am twitter"
    }, function (err, data) {
        //This is a callback
        if (err) {
            //chaining
            return res.status(400).send(err);
        }
        res.send("Tweet successful");
    });
})

app.get('/search', function (req, res) {
    var credentials = auth.getCredentials();
    if (!credentials.access_token || !credentials.access_token_secret) {
        return res.send(418);
    }
    var url = "https://api.twitter.com/1.1/search/tweets.json";
    var query = queryString.stringify({q:"That_One_Ghoti"});
    url += '?' + query;
    auth.get(url, credentials.access_token, credentials.access_token_secret, function (err, data) {
        if (err) {
            return res.status(400).send(err);
        }
        res.send(data);
    });
});

app.get('/friends', function (req, res) {
    var credentials = auth.getCredentials();
    if (!credentials.access_token || !credentials.access_token_secret) {
        return res.sendStatus(418);
    }
});

app.get(url.parse(config.oauth_callback).path, function (req, res) {
    auth.authenticate(req, res, function (err) {
        //This grabs the auth file and the authenticate function within the file
        if (err) {
            console.log(err);
            res.sendStatus(401);
        } else {
            res.send("Authentication Successful")
        }
        var url = "https://api.twitter.com/1.1/friends/list.json";
        if (req.query.cursor) {
            
        }
        auth.get(url, credentials.access_token, credentials.access_token_secret, function (err, data) {
            if (err) {
                return res.status(400).send(err);
            }
            res.send(data);
        });
    })
})

//Building a server to listen on port 8080
app.listen(config.port, function () {
    console.log("Server is listening on localhost port:%s", config.port);
    console.log("Oauth callback: " + url.parse(config.oauth_callback).hostname + url.parse(config.oauth_callback).path);
});