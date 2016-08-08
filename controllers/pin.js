var assert = require('assert');
var chalk = require('chalk');
var Pin = require("../models/pin");

exports.create = function(req, res) {
    console.log(chalk.green("We're in Pin create!"));
    console.dir(req);
    
    assert.notEqual(req.user, undefined, "User information required to post new Pin.");
    assert.notEqual(req.body.title, undefined, "Pin title is missing, but required.");
    assert.notEqual(req.body.url, undefined, "Pin URL is missing, but required.");
    
    
    var pin = new Pin({
        pinOwner: {
            userProvider:   req.user.provider,
            userId:         req.user.id,
            userName:       req.user.username
        },
        imgUrl: req.body.url,
        title: req.body.title,
        likes: [] //Empty array
    });
    
    pin.save(function (err) {
        if (err) {
            console.log(chalk.bgRed.black("Error :") + err);
            res.json({status: "ERROR"});
            return false;
        }
        else {
            console.log(chalk.green("Pin saved!"));
            res.json({status: "Pin saved!"});
            return true;
        }
    });
    
}