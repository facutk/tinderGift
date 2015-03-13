angular.module('tinderGiftApp', ['ngFacebook', 'firebase','ngRoute', 'xeditable', 'ui.bootstrap', 'dndLists'])

.value('fbURL', 'https://tindergift.firebaseio.com/')

.config(['$facebookProvider', function($facebookProvider) {
    //$facebookProvider.setAppId('342947875890308').setPermissions(['email','user_friends']);
    $facebookProvider.setAppId('346517602200002').setPermissions(['email','user_friends']); // DEV
}])

.run(['$rootScope', '$window', function($rootScope, $window) {
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    $rootScope.$on('fb.load', function() {
        $window.dispatchEvent(new Event('fb.load'));
    });
}])

.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
})

.run(["$rootScope", "$location", function($rootScope, $location) {
    $rootScope.$on("$routeChangeSuccess", function(user) {
    });
 
    $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
        if (eventObj.authenticated === false) {
            $location.path("/login");
        }
    });
}])

.service('User', function ($window) {
    return {
        save: function ( user ) {
            $window.localStorage.setItem( "user", angular.toJson( user ) );
        },
        load: function() {
            return angular.fromJson( $window.localStorage.getItem("user") );
        },
        logout: function () {
            $window.localStorage.removeItem( "user" );
        }
    };

})

.service('fbRef', function(fbURL) {
  return new Firebase(fbURL)
})
.service('Cards', function(fbURL, $firebase){
    return $firebase(new Firebase(fbURL + 'card/')).$asArray();
})
.factory('MercadoLibre', function($http){
    return {
        getInfo: function( url ) {
            ml_url = url;
            if ( ml_url.indexOf('http') > -1 ) {
                ml_url = url.substr(url.indexOf('://')+3);
            };
            return $http.jsonp( 'https://facutk.alwaysdata.net/mercadolibre/' + ml_url + '?callback=JSON_CALLBACK&_=' + (new Date().getTime()) );
        }
    };
})
.config(function($routeProvider) { 
    $routeProvider
    .when('/', {
        controller:'LandingCtrl',
        templateUrl:'landing.html',
        resolve: {
            user: ["$q", "User", function($q, User) {
                var user = User.load();

                if (user) {
                    return $q.when(user);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }]
        }
    })
    .when('/login', {
        controller:'LoginController',
        templateUrl:'login.html',
    })
    .when('/list', {
        controller:'ListCtrl',
        templateUrl:'list.html',
    })
    .when('/edit/:cardId', {
        controller:'EditCtrl',
        templateUrl:'detail.html'
    })
    .when('/new', {
        controller:'NewController',
        templateUrl:'detail.html',
        resolve: {
            user: ["$q", "User", function($q, User) {
                var user = User.load();

                if (user) {
                    return $q.when(user);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }]
        }
    })
    .when('/friends', {
          controller:'myCtrl',
          templateUrl:'landing.html'
    })
    .when('/example', {
          controller:'Example',
          templateUrl:'example.html'
    })
    .when('/logout', {
          controller:'LogoutController',
          template:''
    })
    .otherwise({
        redirectTo:'/'
    });
})
.controller('NavCtrl', function($scope, $location) {
    $scope.isActive = function(route) {
        $scope.path = $location.path();
        return $location.path() === route;
    };
})
.controller('LandingCtrl', [ '$scope', 'User', 'user', function($scope, User, user) {
    $scope.user = user;
    $scope.logout = function () {

        User.logout();

    };
}])

.controller('ListCtrl', function($scope, Cards) {
    $scope.cards = Cards;
})
 
.controller('NewController', ['$scope', '$location', 'Cards', 'MercadoLibre', '$facebook', 'User', 'user',
 function($scope, $location, Cards, MercadoLibre, $facebook, User, user ) {

    $scope.card = {};
    $scope.card.link = "";
    $scope.card.images = [];
    $scope.card.expires = false;
    $scope.card.approved = true;
    $scope.card.creator_name = user.name;
    $scope.card.creator_id = user.id;
    $scope.card.modified_date = new Date();


    $scope.save = function() {
        $scope.card.modified_date = Firebase.ServerValue.TIMESTAMP;
        Cards.$add($scope.card).then(function(data) {
            $location.path('/');
        });
    };

    $scope.addImage = function() {
        $scope.card.images.push( { url: $scope.newImage } );
        $scope.newImage = '';
    };
    $scope.removeImage = function(image) {
        var index = $scope.card.images.indexOf(image)
        $scope.card.images.splice( index, 1 );
    };
    $scope.isML = function() {
        return ( $scope.card.link.indexOf("mercadolibre.com") > -1 );
    };
    $scope.fetch = function(){
        if ( $scope.card.link.indexOf("mercadolibre.com") > -1 ) {
            MercadoLibre.getInfo( $scope.card.link )
            .then( function( result ) {
                var data = result.data;
                if ( data.status == "ok") {
                    $scope.card.name = data.name;
                    $scope.card.price = data.price;
                    $scope.card.images = data.images;
                };
            } );        
        }
    }

}])
.controller('EditCtrl', function($scope, $location, $routeParams, Cards) {
        var cardId = $routeParams.cardId, cardIndex;
     
        $scope.cards = Cards;
        cardIndex = $scope.cards.$indexFor(cardId);
        $scope.card = $scope.cards[cardIndex];
     
        $scope.destroy = function() {
            $scope.cards.$remove($scope.card).then(function(data) {
                $location.path('/');
            });
        };
     
        $scope.save = function() {
            $scope.cards.$save($scope.card).then(function(data) {
                $location.path('/');
            });
        };
})

.controller('myCtrl', ['$scope', '$facebook', '$firebase', function($scope, $facebook, $firebase) {

    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.status = $facebook.isConnected();
        if($scope.status) {
            $facebook.api('/me').then(function(user) {
                $scope.user = user;
                
                console.log( $scope.user );

                var ref = new Firebase("https://tindergift.firebaseio.com/");
                console.log( ref.getAuth() );
            });
        };
    });

    $scope.getFriends = function() {
        if(!$scope.status) return;
        $facebook.api('/me/friends').then(function(friends) {
            console.log( friends );
            $scope.friends = friends.data;
        });
    };
    
    $scope.prueba = function() {
    
    };
    
    $scope.chau = function() {
    
    
    };
    

}])

.controller('Example', ['$scope', function($scope) {

    $scope.card = {
        images: []
    };
    //$scope.lista.push({label: "Item A" + 1});

    // Generate initial model
    for (var i = 1; i <= 3; ++i) {
        $scope.card.images.push( {label: "Item A" + i} );
    }

}])

.controller('LoginController', ['$scope', '$facebook', '$firebase', '$location', 'User', 
 function($scope, $facebook, $firebase, $location, User) {
    
    $scope.refresh = function () {
        if( $facebook.isConnected() ) {
            $facebook.api('/me').then(
                function(user) {
                    $scope.user = user;
                    User.save( $scope.user );
                }
            );
        };
    };

    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.refresh();
        $scope.fbLoaded = true;
    });
    $scope.login = function() {
        $facebook.login().then(function() {
            $scope.refresh();
        });
    }  

    $scope.refresh();
    
}])

.controller('LogoutController', ['$scope', '$location', 'User', function($scope, $location, User) {

    User.logout();
    $location.path('/');
    
}])

;
