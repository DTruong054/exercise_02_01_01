var OAuth = require('oauth').OAuth; //If capitalized, this means an object
var config = require('./config.json');

//Temporary storage container
var oauth = new OAuth(
    config.request_token_url,
    config.access_token_url,
    config.consumer_key,
    config.consumer_secret,
    config.oauth_version,
    config.oauth_callback,
    config.oauth_signature
);

var twitterCred = {
    oauth_token: "",
    oauth_token_secret: ""
}

module.exports = {
    redirectLogin: function (req, res) {
        res.send("This is a send"); //This would send to the webpage
    }
}