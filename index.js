var express = require('express');
var app = express();
var authenticator = require('./auth.js');
var config = require('./config.json');
var url = require('url');
var querystring = require('querystring');
var async = require('async');

app.use(require('cookie-parser')());

app.get('/', function(req, res) {
    res.send("<h3>Hello, world!</h3>");
});

app.get('/auth/twitter', authenticator.redirectLogin); 

app.get(url.parse(config.oauth_callback).path, function(req, res) {
    authenticator.authenticate(req, res, function(err) {
        if (err) {
            console.log(err);
            res.sendStatus(401);
        }
        else {
            res.send("Authentication successful!");
        }
    });
});

app.get('/tweet', function(req, res) {
    var credentials = authenticator.getCredentials();
    if (!credentials.access_token || 
       !credentials.access_token_secret) {
        res.sendStatus(401);
    }
    var url = 'https://api.twitter.com/1.1/statuses/update.json';
    authenticator.post(url, credentials.access_token, credentials.access_token_secret, 
        {
            status: "I am tweeting now!"
        }, function(error, data) {
        if (error) {
            return res.status(400).send(error);
        }
        res.send("Tweet successful!")
    });
});

app.get('/search', function(req, res) {
    var credentials = authenticator.getCredentials();
    if (!credentials.access_token || 
       !credentials.access_token_secret) {
        return res.sendStatus(418);
    }
    var url = 'https://api.twitter.com/1.1/search/tweets.json';
    var query = querystring.stringify({ q: 'BMW' });
    url += '?' + query;
    authenticator.get(url, credentials.access_token, 
        credentials.access_token_secret,
        function(error, data) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(data);
    });
});

app.get('/friends', function(req, res) {
    var credentials = authenticator.getCredentials();
    if (!credentials.access_token || 
       !credentials.access_token_secret) {
        return res.sendStatus(401);
    }
    var url = 'https://api.twitter.com/1.1/friends/list.json';
    if (req.query.cursor) {
        url += '?' + querystring.stringify({ cursor: req.query.cursor});
    }
    authenticator.get(url, credentials.access_token, 
        credentials.access_token_secret,
        function(error, data) {
            if (error) {
                return res.status(400).send(error);
            }
            res.send(data);
    });
});

app.get('/allfriends', function(req, res) {
    var credentials = authenticator.getCredentials();
    async.waterfall([
        // get friends ids
        function(callback) {
            var cursor = -1;
            var ids = [];
            console.log("ids.length: " + ids.length);
            async.whilst(function() {
                return cursor != 0;
            }, function(callback) {
                var url = 'https://api.twitter.com/1.1/friends/ids.json';
                url += '?' + querystring.stringify({ user_id: credentials.twitter_id, cursor: cursor });
                authenticator.get(url, credentials.access_token, credentials.access_token_secret,
                    function(error, data) {
                        if (error) {
                            return res.status(400).send(error);
                        }
                        data = JSON.parse(data);
                        cursor = data.next_cursor_str;
                        ids = ids.concat(data.ids);
                        console.log("ids.length: " + ids.length);
                        callback();
                });
            }, 
            function(error) {
                console.log('last callback');
                if (error) {
                    return res.status(500).send(error);
                }
                console.log(ids);
                callback(null, ids);
            });
        },
        // lookup friends data
        function(ids, callback) {
            var getHundredIds = function(i) {
                return ids.slice(100*i, Math.min(ids.length, 100*(i+1)));
            };
            var requestsNeeded = Math.ceil(ids.length/100);
            async.times(requestsNeeded, function(n, next) {
                var url = "https://api.twitter.com/1.1/users/lookup.json";
                url += "?" + querystring.stringify({ user_id: getHundredIds(n).join(',')});
                authenticator.get(url, credentials.access_token, credentials.access_token_secret, 
                function(error, data) {
                    if (error) {
                        return res.status(400).send(error);
                    }
                    var friends = JSON.parse(data);
//                    console.log("n: ", n, friends);
                    next(null, friends);
                });
            }, 
            function(error, friends) {
                friends = friends.reduce(function(previousValue, currentValue, currentIndex, array) {
                    return previousValue.concat(currentValue);
                }, []);
                friends.sort(function(a, b) {
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                });
                res.send(friends);
                console.log('friends.length', friends.length);
            });
        }
    ]);
//    res.sendStatus(200);
});

app.listen(config.port, function() {
    console.log("Server is listening on localhost:%s", config.port);
    console.log("OAuth callback:%s" , url.parse(config.oauth_callback).hostname + url.parse(config.oauth_callback).path);
});