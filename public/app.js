var ngApp = angular.module('fcc-bp-pclone', ['ui.router', 'ngAnimate']);
ngApp.config(function ($stateProvider, $urlRouterProvider) {
    console.log("Inside router!!!");
    console.log(typeof $urlRouterProvider);
    $urlRouterProvider.otherwise('/recent'); //Where we go if there is no route

    // templateProvider: Provider function that returns HTML content string. See http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$stateProvider
    $stateProvider
        .state('mypins', {
            url: '/mypins',
            templateUrl: 'mypins' //Resolves to newpoll.pug in routes.js
        })
        .state('newpin', {
            url: '/newpin',
            templateUrl: 'newpin'
        })
        .state('recent', {
            url: '/recent',
            templateUrl: 'recent'
        });
    
    //When a user returns from auth
    $stateProvider.state('loginRtn', {
        url: '/loginRtn',
        templateUrl: 'loginrtn'
    });
    
});

ngApp.controller('newPin', ['$scope', function($scope) {
    $scope.addPin = function() {
        $.post("add", $("#add-new-form").serialize())
        .done(function(data) {
            console.dir(data);
        });
    };
    
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
        //console.log(fromState); //will give the object of old state
        //console.log(toState); //will give the object of current state
        //console.log(toState.name); //current state name
        if (toState.name == 'newpin') {
            console.log("%c At newpin!", "color:blue; font-size:20px");
            $("#addNewForm input[name=url]").keydown(function() {
                console.log("Ow!!!");
            });
        }
        
    });
    
    $scope.UrlImg = /^https?:\/\/[\w./]+\/[\w./]+\.(bmp|png|jpg|jpeg|gif)$/;
    
    //Note, this function only gets called when ng-change detects an ng-valid change
    $scope.foo = function() {
        console.log("At foo");
        console.dir($scope.addNewForm);
    }
    
}]);

$(function() { //Document ready
    
    console.log("%cDocument ready", "color:green;");
    if (typeof angular === "undefined") {
        console.group('%cAngular is not loaded', "color:red; font-size: 16px;");
        console.log("This app requires Angular to run correctly.")
        console.groupEnd();
    }
    
    //Also works when an elements acceskey is used (instead of click)
    $(".navbar-nav>li>a").click(function(event) {
        if (event.clientX == 0 && event.clientY == 0) { //Keyboard was used instead of mouse (as clientX & Y is the mouse's position)
            //console.dir(event);
            $(event.target.parentElement).addClass("navKbSelect");
            $(event.target.parentElement).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
                //console.log("Animation ended...");
                //console.dir(event);
                $(event.target).removeClass("navKbSelect");
            });     
        }
    });
    
});
