var express = require('express');
var router = express.Router();
var passport = require('passport');
var pin = require('../controllers/pin');

//Login check
var loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
};

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

router.get('/home', function(req, res, next) {
    res.render("home.pug");
})

router.get('/login', function(req, res, next) {
    res.render('login.pug');
});

router.get('/loginRtn', function(req, res, next) {
    res.render("loginrtn.pug");
});

//loggedIn middleware is being used because you can't log out if you aren't logged in...
router.get('/logout', loggedIn, function(req, res, next) {
    req.logout();
    res.render('logout.pug');
});

router.get('/mypins', loggedIn, function(req, res, next) {
    //Continue here
    res.render('mypins.pug');
});

router.get('/newpin', loggedIn, function(req, res, next) {
    res.render('newpin.pug');
});

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
    
    res.locals.pinLimit = 12; //Limit the query to just 12 pins...
    pin.getRecentPins(req, res);
})

router.post('/addpin', loggedIn, function(req, res, next) {
    console.log("ADD called");
    console.dir(req.body);
    pin.create(req, res);
});

module.exports = router;
