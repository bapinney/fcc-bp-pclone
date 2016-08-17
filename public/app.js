//var globalInst;
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
        .state('logout', {
            url: '/logout',
            templateUrl: 'logout'
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
        })
        .state('user', {
            url: '/user/:username',
            templateUrl: 'user' //Resolves to userpins.pug in routes.js
        });
    
    //When a user returns from auth
    $stateProvider.state('loginRtn', {
        url: '/loginRtn',
        templateUrl: 'loginrtn'
    });
    
});

ngApp.controller('logout', function($scope, $http) {
    $scope.$on('$stateChangeSuccess', function() { 
        console.log("%c At logout!", "color:blue; font-size:20px");
        document.location.href = "/"; //The purpose of this is to break out of the UI-Router container as the header will now be different (i.e., the Sign Out button will now be a Sign In button)
    });
});

ngApp.controller('mypins', function($scope, $compile, $http) {
    $scope.$on('$stateChangeSuccess', function() {
        console.log("%c At my pins!", "color:orange; font-size:12px");
        if (typeof $http !== "function") {
            console.error("%cExpecting $http to be type of function.  $http currently is " + typeof $http, "background-color:black; color: red; font-size:18px");
        }
        
        var htConfig = {
            method: "GET",
            url:    "/mpdata"
        };
        
        var gridInit = function() {
            $('.grid').masonry({
                itemSelector:   '.grid-item',
                columnWidth:    4
            })
        };
        
        console.log("About to make http call for mypin data...");
        $http(htConfig).
            then(function(response) {
                window.dbgResponse = response;
                console.log("At .then\n Removing loading banner...");
                $("#loading-div").slideUp();
                for (var i=0; i < response.data.length; i++) {
                    var pin = $('<div class="grid-item"></div>');
                    var img = document.createElement("img");
                    img.src = response.data[i].imgUrl;
                    pin.append(img);

                    var voteBtn = document.createElement("button");
                        voteBtn.className = "vote-button";
                        voteBtn.setAttribute("ng-click", "showAlert($event)")
                        var star = document.createElement("i");
                        star.className = "fa fa-star";
                        voteBtn.appendChild(star);
                        var starCount = document.createElement("span");
                        starCount.className = "star-count";
                        starCount.textContent = response.data[i].likes.length;
                        voteBtn.appendChild(starCount);
                    pin.append(voteBtn);
                    console.log("Finished appending voteBtn... here is is...");
                    console.dir(voteBtn);
                    $compile(voteBtn)($scope);
                    
                    if ($("#li-sign-out").data("username") == response.data[i].pinOwner[0].userName) {
                        var deleteBtn = document.createElement("button");
                        deleteBtn.className = "delete-button";
                        deleteBtn.title = "Delete this Pin";
                        var deleteIcon = document.createElement("i");
                        deleteIcon.className = "fa fa-remove";
                        deleteBtn.appendChild(deleteIcon);
                        deleteBtn.setAttribute("ng-click", "delete($event)");
                        pin.append(deleteBtn);
                        $compile(deleteBtn)($scope);
                    }
                    
                    var title = response.data[i].title;
                    var titleDiv = document.createElement("div");
                    titleDiv.className = "pin-title";
                    titleDiv.textContent = title;
                    pin.append(titleDiv);
                    
                    
                    //Pin Owner Username
                    var pinInfo = document.createElement("a");
                    pinInfo.className = "pin-info";
                    //pinInfo.setAttribute("ui-sref", `user({username: ${response.data[i].pinOwner[0].userName}})`);
                    
                    pinInfo.setAttribute("ui-sref", `user({username: '${response.data[i].pinOwner[0].userName}'})`);
                    pinInfo.textContent = response.data[i].pinOwner[0].userName;
                    pin.append(pinInfo);
                    pin[0].setAttribute("data-pin-id", response.data[i]._id);
                    $("#mypins-div").append(pin);
                    $compile(pin)($scope);
                }
                console.dir(response);
                window.globalResp = response;
                console.log("Waiting for images to load...");
                var triggerRelisten = false; //This will get set to true if any image is found broken and we need to wait for its replacement to finish loading
                $("#mypins-div").imagesLoaded()
                    .always(function(instance) {
                        console.log("All immages loaded!");
                        //globalInst = instance;
                        if (instance.hasAnyBroken === true) {
                            console.log("%c There are broken images!", "font-color: red; font-size:12px;");
                            for (var i=0; i < instance.images.length; i++) {
                                if (!instance.images[i].isLoaded) {
                                    instance.images[i].img.src = "/images/brokenImg.png";
                                    triggerRelisten = true;
                                }
                            }
                            if (triggerRelisten) {
                                imgRelisten();
                            }
                        }
                        //console.dir(instance);
                        $(".grid").masonry({
                            itemSelector: '.grid-item',
                            columnWidth: 4
                        });
                    });
                //
                
            }, function(response) {
            console.log("At failed...");
            if (typeof $("#loading-div")[0] !== "undefined") {
                $("#loading-div").text("Error loading data...");
                $("#loading-div").addClass("bg-danger");
            }
        });
        
    });
});

ngApp.controller('newPin', function($scope, $http) {
    $scope.addPin = function() {
        console.log("%c Add Pin called", "color:blue; font-size:16px");
        
        // The data we want to POST is stored here
        //console.dir($scope.pin);
        
        $("#button-add").addClass('addbtn-info');
        $("#button-add").text("Adding Pin...")
        
        var req = { //Our POST request
            method: "POST",
            url: "/addpin",
            data: $scope.pin
        };
        
        $http(req).then(function(res) {
            console.log("Request successful...");
            $("#button-add").text("Added!");
            setTimeout(function() { document.location.hash = "recent"; }, 2000);
        }, function(res) {
            console.log("%c Request failed", "color:red font-size:18px");
            console.dir(res);
        });
        
    };
    
    //RegEx for valid image URL
    $scope.UrlImg = /^https?:\/\/[\w./-]+\/[\w./-]+\.(bmp|png|jpg|jpeg|gif)$/;
    
    $scope.$on('$stateChangeSuccess', function() { 
        console.log("%c At newpin!", "color:blue;");
        //Bring the focus to the Pin Title, as that is the first element in the form...
        $("#field-title").focus();
    });
    
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
    }
    
});

ngApp.controller('recent', function($scope, $location, $compile, $http) {
    
    /*  Broadcasted after a URL was changed.
        https://docs.angularjs.org/api/ng/service/$location */
    $scope.$on('$locationChangeSuccess', function() {
        console.dir($location);
        console.log("Location change success!  $location.path is " + $location.path() + " while document.location.hash is " + document.location.hash);
        if ($("#li-sign-out").data("username") == undefined) {
            console.log("%cNot signed in", "font-size:14px");
            sessionStorage.setItem("preLoginPage", document.location.hash);
        }
    })
    $scope.$on('$stateChangeSuccess', function() { 
        console.dir($location);
        console.log("%c At recent pins!", "color:orange;");
        console.log("State change success!  $location.path is " + $location.path() + " while document.location.hash is " + document.location.hash);
        if (typeof $http !== "function") {
            console.error("%cExpecting $http to be type of function.  $http currently is " + typeof $http, "background-color:black; color: red; font-size:18px");
        }
        console.log("Loading recent pins...");
        
        var htConfig = {
            method: "GET",
            url: "/rpdata"
        };
        
        var gridInit = function() {
            $(".grid").masonry({
                itemSelector:   '.grid-item',
                columnWidth:    4
            });
        };
        
        var imgRelisten = function() {
            $("#recent-div").imagesLoaded()
            .always(function(instance) {
                gridInit();
            });
        };
        
        $http(htConfig).
            then(function(response) {
                window.dbgResponse = response;
                console.log("At .then\n Removing loading banner...");
                $("#loading-div").slideUp();
                for (var i=0; i < response.data.length; i++) {
                    var pin = $('<div class="grid-item"></div>');
                    var img = document.createElement("img");
                    img.src = response.data[i].imgUrl;
                    pin.append(img);

                    var voteBtn = document.createElement("button");
                        voteBtn.className = "vote-button";
                        voteBtn.setAttribute("ng-click", "starPin($event)")
                        var star = document.createElement("i");
                        star.className = "fa fa-star";
                        voteBtn.appendChild(star);
                        var starCount = document.createElement("span");
                        starCount.className = "star-count";
                        starCount.textContent = response.data[i].likes.length;
                        voteBtn.appendChild(starCount);
                    pin.append(voteBtn);
                    $compile(voteBtn)($scope);
                    
                    if ($("#li-sign-out").data("username") == response.data[i].pinOwner[0].userName) {
                        var deleteBtn = document.createElement("button");
                        deleteBtn.className = "delete-button";
                        deleteBtn.title = "Delete this Pin";
                        var deleteIcon = document.createElement("i");
                        deleteIcon.className = "fa fa-remove";
                        deleteBtn.appendChild(deleteIcon);
                        deleteBtn.setAttribute("ng-click", "delete($event)");
                        pin.append(deleteBtn);
                        $compile(deleteBtn)($scope);
                    }
                    
                    var title = response.data[i].title;
                    var titleDiv = document.createElement("div");
                    titleDiv.className = "pin-title";
                    titleDiv.textContent = title;
                    pin.append(titleDiv);
                    
                    var pinInfo = document.createElement("a");
                    pinInfo.className = "pin-info";
                    pinInfo.setAttribute("ui-sref", `user({username: '${response.data[i].pinOwner[0].userName}'})`);
                    pinInfo.textContent = response.data[i].pinOwner[0].userName;
                    pin.append(pinInfo);
                    pin[0].setAttribute("data-pin-id", response.data[i]._id);
                    $("#recent-div").append(pin);
                    $compile(pin)($scope);
                }
                console.dir(response);
                window.globalResp = response;
                console.log("Waiting for images to load...");
                var triggerRelisten = false; //This will get set to true if any image is found broken and we need to wait for its replacement to finish loading
                $("#recent-div").imagesLoaded()
                    .always(function(instance) {
                        console.log("All immages loaded!");
                        //globalInst = instance;
                        if (instance.hasAnyBroken === true) {
                            console.log("%c There are broken images!", "font-color: red; font-size:12px;");
                            for (var i=0; i < instance.images.length; i++) {
                                if (!instance.images[i].isLoaded) {
                                    instance.images[i].img.src = "/images/brokenImg.png";
                                    triggerRelisten = true;
                                }
                            }
                            if (triggerRelisten) {
                                imgRelisten();
                            }
                        }
                        //console.dir(instance);
                        $(".grid").masonry({
                            itemSelector: '.grid-item',
                            columnWidth: 4
                        });
                    });
                //
                
            }, function(response) {
                console.log("At failed...");
                if (typeof $("#loading-div")[0] !== "undefined") {
                    $("#loading-div").text("Error loading data...");
                    $("#loading-div").addClass("bg-danger");
                }
            })
        
        
        
    });
    
    $scope.starPin = function(eventVar) {
        console.log("%cStar pin called...", "color:blue");
        console.log("Here is eventVar");
        console.dir(eventVar);
        var pin2star = eventVar.currentTarget.parentNode.dataset.pinId;
        var htConfig = {
            method: "POST",
            data: {pinId: pin2star},
            url: "/starpin"
        };
        
        $http(htConfig).then(function(response) {
            console.log("At star .then...");
            window.dbgStar = response;
            console.dir(response);    
            if (response.data.status == "vote added") {
                //Increase vote count
                document.querySelector('[data-pin-id="' + pin2star + '"] .vote-button .star-count').innerText = parseInt(document.querySelector('[data-pin-id="' + pin2star +'"] .vote-button .star-count').innerText,10) + 1;
                //Make button green to confirm voting
                document.querySelector('[data-pin-id="' + pin2star + '"] .vote-button').classList.add("voted-button");
            }
            if (response.data.status == "vote removed") {
                //Decrease vote count
                document.querySelector('[data-pin-id="' + pin2star + '"] .vote-button .star-count').innerText = parseInt(document.querySelector('[data-pin-id="' + pin2star +'"] .vote-button .star-count').innerText,10) - 1;
                //Remove green button color to confirm (un)voting
                document.querySelector('[data-pin-id="' + pin2star + '"] .vote-button').classList.remove("voted-button");
            }
        }, 
        //Error function
        function(response){
            console.log("At error...");
            console.dir(response);
            if (response.status == 401) { //If we get unauthorized, we need to sign in.  This takes care of that. 
                //There will be UI feedback for this, too, to show the end-user they are going to be signed in to perform this action
                document.querySelector('#li-sign-in a').click();
            }
        });
        
        
    };
    
    $scope.delete = function(evntVar) {
        var pinId = evntVar.currentTarget.parentNode.dataset.pinId;
        $http({
            method: "POST",
            data: {pinId: pinId},
            url: "/deletePin"
        }).then(function(response) {
            console.dir(response);
            window.dbgResp2 = response;
            if (response.data.result == "fail" && typeof response.data.error == "string") {
                window.alert("There was an error while trying to remove Pin: " + response.data.error);
            }
            if (response.data.result == "success") {
                $('[data-pin-id="' + pinId +'"]').effect({
                    effect: "explode",
                    duration: 2000,
                    complete: function() {
                        $(this).remove();
                        $(".grid").masonry({
                            itemSelector: '.grid-item',
                            columnWidth: 4
                        });
                    }   
                });
            }
        })
    };
    
});

ngApp.controller('userpins', function($scope, $location, $compile, $http) {
    /*  Broadcasted after a URL was changed.
        https://docs.angularjs.org/api/ng/service/$location */
    $scope.$on('$locationChangeSuccess', function() {
        if ($("#li-sign-out").data("username") == undefined) {
            console.log("Not signed in");
            sessionStorage.setItem("preLoginPage", document.location.hash);
        }
    });
    
    $scope.$on('$stateChangeSuccess', function() {
        var pinUser = $location.$$path.split("/")[2];
        $("#title-text").text(pinUser);
        console.dir($location);
        console.log(`Loading pins for ${pinUser}...`);
        
        var htConfig = {
            method: "GET",
            url: `/updata/${pinUser}`
        };
        
        $http(htConfig).then(function(response) {
            console.log("%cAt response", "font-size:12px; color:green");
            console.dir(response);
            $("#loading-div").slideUp();
            
            for (var i = 0; i < response.data.length; i++) {
                var pin = $('<div class="grid-item"></div>');
                var img = document.createElement("img");
                img.src = response.data[i].imgUrl;
                pin.append(img);
                
                //Let the user delete their own pins if they are viewing their own page
                if ($("#li-sign-out").data("username") == response.data[i].pinOwner[0].userName) {
                    var deleteBtn = document.createElement("button");
                    deleteBtn.className = "delete-button";
                    deleteBtn.title = "Delete this Pin";
                    var deleteIcon = document.createElement("i");
                    deleteIcon.className = "fa fa-remove";
                    deleteBtn.appendChild(deleteIcon);
                    deleteBtn.setAttribute("ng-click", "delete($event)");
                    pin.append(deleteBtn);
                    $compile(deleteBtn)($scope);
                }
                
                var title = response.data[i].title;
                var titleDiv = document.createElement("div");
                titleDiv.className = "pin-title";
                titleDiv.textContent = title;
                pin.append(titleDiv);
                
                pin[0].setAttribute("data-pin-id", response.data[i]._id);
                $("#userpin-div").append(pin);
                $compile(pin)($scope);
            }
            
            var triggerRelisten = false; //This will get set to true if any image is found broken and we need to wait for its replacement to finish loading
            $("#recent-div").imagesLoaded()
                .always(function (instance) {
                    console.log("All immages loaded!");
                    //globalInst = instance;
                    if (instance.hasAnyBroken === true) {
                        console.log("%c There are broken images!", "font-color: red; font-size:12px;");
                        for (var i = 0; i < instance.images.length; i++) {
                            if (!instance.images[i].isLoaded) {
                                instance.images[i].img.src = "/images/brokenImg.png";
                                triggerRelisten = true;
                            }
                        }
                        if (triggerRelisten) {
                            imgRelisten();
                        }
                    }
                    //console.dir(instance);
                    $(".grid").masonry({
                        itemSelector: '.grid-item',
                        columnWidth: 4
                    });
                });
            //
        },function(response) {
            console.log("%cAt failed", "font-size:12px; color:red");
            console.dir(response);
        });
        
        
    });
    
    
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