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
        oauth.getOAuthRequestToken(function (err, oauth_token, oauth_token_secret, results) { 
            //Method that recives the request token
            if (err) {
                console.log(err);
                res.send("There was an error trying to process your request, please try again at a later date");
            } else{
                twitterCred.oauth_token = oauth_token;
                twitterCred.oauth_token_secret = oauth_token_secret;
                res.send("Credentials stored!");
            }
        })
    }
}