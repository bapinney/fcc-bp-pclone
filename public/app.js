$(function() { //Document ready
    var app = angular.module("fcc-bp-pclone", ['ui.router', 'ngAnimate']);
    app.config(function ($stateProvider, $urlRouterProvider) {
        console.log(typeof $urlRouterProvider);
        $urlRouterProvider.otherwise('/home'); //Where we go if there is no route

        // templateProvider: Provider function that returns HTML content string. See http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$stateProvider
        $stateProvider
            .state('home', {
                url: '/home',
                params: {reload: true}, 
                templateUrl: 'home'
            })
            .state('mypins', {
                url: '/mypins',
                templateUrl: 'mypins' //Resolves to newpoll.pug in routes.js
            })
            .state('recent', {
                url: '/recent',
                templateUrl: 'recentpins'
            });
    });
    
    console.log("%cDocument ready", "color:green;");
    if (typeof angular === "undefined") {
        console.group('%cAngular is not loaded', "color:red; font-size: 16px;");
        console.log("This app requires Angular to run correctly.")
        console.groupEnd();
    }
    
    //Also works when an elements acceskey is used (instead of click)
    $(".navbar-nav>li>a").click(function(event) {
        if (event.clientX == 0 && event.clientY == 0) { //Keyboard was used instead of mouse (as clientX & Y is the mouse's position)
            console.dir(event);
            $(event.target.parentElement).addClass("navKbSelect");
            $(event.target.parentElement).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
                console.log("Animation ended...");
                console.dir(event);
                $(event.target).removeClass("navKbSelect");
            });     
        }
    });
    
    
});