var assert = require('assert');
var chalk = require('chalk');
var Pin = require("../models/pin");

exports.create = function(req, res) {
    console.log(chalk.green("We're in Pin create!"));
    console.log(typeof mongoose);
    
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
};

exports.getRecentPins = function(req, res) {
    
    //Use a hard-coded limit if one was not provided
    var queryLimit = (typeof res.locals.pinLimit == "number" ? res.locals.pinLimit : 18);
    
    Pin.find(
            {},
            {"pinOwner.userId": 0, "pinOwner._id": 0} //This is just to get in the habit of learning to exlucde info that is not necessary.  Exposing unneeded or sensitive stuff can be dangerous in future apps which could handle more sensitive data
        )
        .limit(queryLimit)
        .sort({dateCreated: -1}) //Recent, so sort descending...
        .exec(function(err, docs) {
            if (docs) {
                res.json(docs);
            }
            else {
                res.json({error: "No pins found"});
            }
        });
};

exports.getUserPins = function(req, res) {
    
    //Use a hard-coded limit if one was not provided
    var queryLimit = (typeof res.locals.pinLimit == "number" ? res.locals.pinLimit : 48);
    
    if (typeof res.locals.forUserName == "undefined" || res.locals.forUserName.length == 0) 
    {
        res.json({error: "userName undefined or 0 length"});
        return false;
    }
    
    var forUserName = res.locals.forUserName;
    
    console.log(chalk.green("We're in getUserPins..."));
    console.log(`Querying for ${forUserName}`);
    
    Pin.find(
        {"pinOwner.userName" : forUserName},
        {"pinOwner.userId": 0, "pinOwner._id": 0} //This is just to get in the habit of learning to exlucde info that is not necessary.  Exposing unneeded or sensitive stuff can be dangerous in future apps which could handle more sensitive data
    )
    .limit(queryLimit)
    .sort({dateCreated: -1}) //Recent, so sort descending...
    .exec(function(err, docs) {
        if (docs) {
            res.json(docs);
        }
        else {
            res.json({error: "No pins found"});
        }
    });
    
};