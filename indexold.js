/**
 * Name: Daniel Truong
 * Date: 1.17.19
 * FileName: index.js
 */

var express = require('express');
var app = express();
var auth = require('./auth.js');
var config = require('./config.json');
var url = require('url');
var queryString = require('querystring');
var async = require('async');

//The "app.use" need a function. The require('cookie-parser') fills in for the function, and the () after are needed for parameters. 
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
    var url = "https://api.twitter.com/1.1/friends/list.json"
    if(req.query.cursor) {
        url += '?' + queryString.stringify({ cursor: req.query.cursor })
    }
    authenticator.get(url, credentials.access_token, credentials.access_token_secret, function(err, data) {
        if(err) {
            return res.status(400).send(err);
        }
        res.send(data);
    });
});

app.get('/allfriends', function(req, res) {
    var credentials = auth.getCredentials();
    async.waterfall([
        // Grabbing friend's ID
        function (callback) {
            var cursor = -1;
            var ids = [];
            console.log("ids.length: " + ids.length);
            async.whilst(function() {
                return cursor != 0;
            },
            function(callback) {
                var url = "https://api.twitter.com/1.1/friends/ids.json";
                url += "?" + queryString.stringify({ user_id: credentials.twitter_id, cursor: cursor});
                auth.get(url, credentials.access_token, credentials.access_token_secret, function(err, data) {
                    if(err) {
                        return res.status(400).send(err);
                    }
                    data = JSON.parse(data);
                    cursor = data.next_cursor_str;
                    ids = ids.concat(data.ids);
                    console.log("ids.length: " + ids.length)
                    callback();
                });
            });
        },
        function (err) {
            console.log('last callback');
            if (err) {
                return res.status(400).send(err);
            }
            console.log(ids);
            callback(null, ids);
        },

        // Search friends data
        function (ids, callback) {
            var getHundredsIds = function (i) {
                //Count control loop
                return ids.slice(100*i, Math.min(ids.length, 100*(i+1))); //This grabs the number of friends and divides by 100, then rounds up the number.
            };
            var requestsNeeded = Math.ceil(ids.length/100);
            async.times(requestsNeeded, function (n, next) {
                var url = "https://api.twitter.com/1.1/users/lookup.json";
                //Calling the api
                url += "?" + queryString.stringify({ user_id: getHundredsIds(n).join(',') });
                auth.get(url, credentials.access_token, credentials.access_token_secret, function (err, data) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    var friends = JSON.parse(data);
                    console.log("n: ", n ,data);
                    next(null, friends);
                });
        },
        function (err, friends) {
            friends = friends.reduce(function (prev, curr, currIndex, array) { //previous and current shortened
                return prev.concat(curr); //Concat = concatenate
            }, [] );

            //Sorts the friends name in order
            friends.sort(function (a, b) {
                return a.name.toLowerCase().localCompare(b.name.toLowerCase());
            });
            res.send(friends);
            console.log("ids.length: ", ids.length);
        });
        }
    ]);
    // res.sendStatus(200);
});

// =========================================================================================================
// function (ids, callback) {
//     var getHundredsIds = function (i) {
//         return ids.slice(100 * i, Math.min(ids.length, 100 * (i + 1)));
//     };
//     var requestsNeeded = Math.ceil(ids.length/100);
//     async.times(requestsNeeded, function (n, next) {
//         var url = "https://api.twitter.com/1.1/users/lookup.json";
//         url += "?" + queryString.stringify({ user_id: getHundredsIds(n).join(',')});
//         auth.get(url, credentials.access_token, credentials.access_token_secret, function (err, data) {
//             if (err) {
//                 return res.status(400).send(err);
//             }
//             var friends = JSON.parse(data);
//                 // console.log("n: ", n, friends)
//             next(null, friends);
//         });
//     })
// }, 
// function(err, friends){
//     friends = friends.reduce(function (prev, curr, currIndex, array) {
//         return prev.concat(curr);
//     }, []);
//     friends.sort(function (a, b) {
//         return a.name.toLowercase().localCompare(b.name.toLowercase())
//     });
//     res.send(friends);
//     console.log('friends.length:', friends.length);
// }
// =========================================================================================================

app.get(url.parse(config.oauth_callback).path, function (req, res) {
    auth.authenticate(req, res, function (err) {
        // Gets Authenticate function
        if (err) {
            console.log(err);
            res.sendStatus(401);
        } else {
            res.send("Authentication Successful")
        }
        var url = "https://api.twitter.com/1.1/friends/list.json";
    })
})

//Building a server to listen on port 8080
app.listen(config.port, function () {
    console.log("Server is listening on localhost port:%s", config.port);
    console.log("Oauth callback: " + url.parse(config.oauth_callback).hostname + url.parse(config.oauth_callback).path);
});
