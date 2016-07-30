var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.dir(req);
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
	successRedirect : '/',
	failureRedirect : '/'
}));

module.exports = router;
