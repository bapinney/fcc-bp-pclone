var ngApp = angular.module('fcc-bp-pclone', ['ui.router', 'ngAnimate']);
ngApp.config(function ($stateProvider, $urlRouterProvider) {
    console.log("Inside router!!!");
    console.log(typeof $urlRouterProvider);
    $urlRouterProvider.otherwise('/home'); //Where we go if there is no route

    // templateProvider: Provider function that returns HTML content string. See http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$stateProvider
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'home'
        })
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


ngApp.controller('newPin', function($scope, $http) {
    $scope.addPin = function() {
        console.log("%c Add Pin called", "color:blue; font-size:18px");
        
        var debugDump = angular.copy(pin);
        console.dir(debugDump);
        
        /*
        $.post("addpin", $("#add-new-form").serialize())
        .done(function(data) {
            console.dir(data);
            if (data.hasOwnProperty("result") && data.result == "OK") {
                console.log("%c Add new success!", "color:green; font-size:18px");
            }
        });
        */
    };
    
    //RegEx for valid image URL
    $scope.UrlImg = /^https?:\/\/[\w./-]+\/[\w./-]+\.(bmp|png|jpg|jpeg|gif)$/;
    
    //Remember we are in the newPin controller already...
    $scope.$on('$stateChangeSuccess', function() { 
        console.log("%c At newpin!", "color:blue; font-size:20px");
        console.log("$http is typeof " + (typeof $http));
        //Bring the focus to the Pin Title, as that is the first element in the form...
        $("#field-title").focus();
        
    });
    
    /**
     * Checks if the form data is valid.  If it is, buttons become enabled for the user to submit the form
     */
    var validateForm = function() {
        
        //If valid URL but button is disabled...
        if($scope.UrlImg.test($("#addNewForm input[name=url]")[0].value) && $("#button-add")[0].disabled) {
            //console.log("undisabling...");
            $("#button-add")[0].disabled = false;
        }
        
        //If invalid URL but at button is NOT disabled...
        if(!$scope.UrlImg.test($("#addNewForm input[name=url]")[0].value) && !$("#button-add")[0].disabled) {
            //console.log("disabling...");
            $("#button-add")[0].disabled = true;
        }
    };
    
    
    /**
     * Checks to see if an IMG tag needs to be added or the form's image URL field is different from the preview IMG's src ...
     */
    var updatePreview = function() {
        //If the placeholder text or an image is there...
        if ($("#image-placeholder")[0].children.length > 0) {
            if ($("#image-placeholder")[0].children[0].tagName == "IMG" && $("#addNewForm input[name=url]")[0].value == $("#image-placeholder")[0].children[0].tagName.src) {
                console.log("It's the same image, do nothing!");
            }
            else {
                $("#image-placeholder > *").fadeOut(1000).remove();
            }
        }
        
        //Create, append (as hidden), and fade in
        var img = document.createElement("img");
        console.log("adding onerror");
        //We are wrapping it in a function() because otherwise we'd be calling that function and setting its value to the onerror property
        img.onerror = function() { imgErrHandler(img) };
        //img.addEventListener("error", imgErrHandler(img));
        img.src = $("#addNewForm input[name=url]")[0].value;
        $(img).hide().appendTo("#image-placeholder").fadeIn(1000);        
    };
    
    var imgErrHandler = function(img) {
        console.log("Image Error handler called...");
        //Add code to check for naturalWidth...
        img.onerror = ""; //Prevent recursion...
        img.src = "/images/brokenimg.png";
        img.width = 100;
        img.height = 100;
        //console.dir(img);
    }
    
    $("#button-add").click(function() {
        console.log("you clicked me!");
    });
    
    
    //Use $("#image-placeholder img")[0].naturalHeight for broken image detection...
    
    //Note, this function only gets called when ng-change detects an ng-valid change
    $scope.urlCheck = function() {
        console.log("At urlCheck");
        updatePreview();
        validateForm();
    }
    
});

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
