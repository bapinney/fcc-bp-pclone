var express = require('express');
var router = express.Router();
var passport = require('passport');
var chalk = require('chalk');
var pin = require('../controllers/pin');
var Pin = require('../models/pin');

//Login check
var loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
};

var errIfLoggedOut = function(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.status(401).send("Must be signed in to perform this action"); //Unauthenticated
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if (typeof req.user !== "undefined") {
        res.render('shell', { title: 'freePinCamp', username: req.user.username });
    }
    else {
        res.render('shell', { title: 'freePinCamp', username: undefined });
    }
});

router.get('/auth/twitter', function(req, res, next) {
    passport.authenticate('twitter', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("USER NOT DEFINED");
            return res.redirect('/');
        }
    })(req, res, next);
});


router.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect : '/#/loginRtn',
	failureRedirect : '/'
}));

router.post('/deletePin', function (req, res, next) {
    if (typeof req.user === "undefined") {
        res.json({
            result: "fail",
            error: "not signed in"
        });
        return false;
    }
    if (typeof req.body.pinId !== "string") {
        res.json({
            result: "fail",
            error: "pinId is not string"
        })
    }
    var pinId = req.body.pinId
    Pin.findById(pinId, function (err, doc) {
        if (err) {
            console.log("An error!");
            console.log(err);
            res.json({
                result: "fail",
                error: "pinId not found"
            });
        }
        if (doc) {
            console.log("doc found!");
            console.log("Here is pin owner info...");
            var PO = {};
            PO.userName      = doc._doc.pinOwner[0].userName;
            PO.userId        = doc._doc.pinOwner[0].userId;
            PO.userProvider  = doc._doc.pinOwner[0].userProvider;
            console.dir(PO);
            console.log("Here is current user info...");
            console.dir(req.user);
            if (req.user.provider == PO.userProvider &&
                req.user.id       == PO.userId       &&
                req.user.username == PO.userName) 
            {   //User Match
                console.log(chalk.green("We have a match! Removing..."));
                var dmResult = doc.remove();
                if (dmResult) {
                    console.log("Remove successful!");
                    res.json({
                        result: "success"
                    });
                    return true;
                }
                else {
                    console.log("Remove unsuccessful...");
                    res.json({
                        result: "fail",
                        error: "Unable to remove pin from collection"
                    });
                    return false;
                }
            }
            else {
                console.log(chalk.red("We don't have a match!"));
                res.json({
                    result: "fail",
                    error: "user is not pinOwner"
                });
                return false;
            }
        }
        else { //Confirmed we get here if we use a non-existant pinId
            res.json({
                result: "fail",
                error: "cannot locate pinId"
            });
            return false;
        }
    });
});

router.get('/home', function(req, res, next) {
    res.render("home.pug");
});

router.get('/login', function(req, res, next) {
    res.render('login.pug');
});

router.get('/loginRtn', function(req, res, next) {
    res.render("loginrtn.pug");
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.render('logout.pug');
});

router.get('/mypins', loggedIn, function(req, res, next) {
    res.render('mypins.pug');
});

//My Pin Data
router.get('/mpdata', loggedIn, function(req, res, next) {
    res.locals.forUserName = req.user.username;
    pin.getUserPins(req, res);
})

router.get('/newpin', loggedIn, function(req, res, next) {
    res.render('newpin.pug');
});


//Recent Pin data
router.get('/recent', function(req, res, next) {
    res.render('recent.pug');
});

router.get('/rpdata', function(req, res, next) {
    /*
    Use this to check client-side error handling
    setTimeout(function() {
        res.status(500);
        res.json({error: "Test error"});
    }, 10000);
    */
    
    res.locals.pinLimit = 18; //Limit the query to just 18 pins...
    pin.getRecentPins(req, res);
});


//User Pin data
router.get('/users/*', function(req, res, next) {
    console.dir(req);
    if (typeof req.params[0] !== "undefined") {
        res.locals.forUserName = req.params[0];
        pin.getUserPins(req, res);
    }
    else {
        res.json({error: "User parameter missing"});
    }
})

router.get('/updata', function(req, res, next) {
    
});


router.post('/addpin', loggedIn, function(req, res, next) {
    console.log("ADD called");
    console.dir(req.body);
    pin.create(req, res);
});


//When the user clicks the star on a pin
router.post('/starpin', errIfLoggedOut, function(req, res, next) {
    console.log("Star Pin called");
    console.dir(req.body);
    pin.star(req, res);
})

module.exports = router;
