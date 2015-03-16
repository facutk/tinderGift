angular.module('tinderGiftApp', ['firebase','ngRoute', 'xeditable', 'ui.bootstrap', 'dndLists', 'ionic', 'ionic.contrib.ui.tinderCards'])

.value('fbURL', 'https://tindergift.firebaseio.com/')

.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
})

.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window) {
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

.factory('Auth', ['$firebaseAuth', 'fbURL', function($firebaseAuth, fbURL) {
    var ref = new Firebase(fbURL);
    return $firebaseAuth(ref);
}])
.service('fbRef', function(fbURL) {
  return new Firebase(fbURL)
})
.factory('Auth', ['$firebaseAuth', 'fbRef', function($firebaseAuth, fbRef) {
    return $firebaseAuth(fbRef);
}])
.service('Cards', function(fbURL, $firebase, $firebaseArray){
    return $firebaseArray( new Firebase(fbURL + 'card/') );
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
 
.controller('NewController', ['$scope', '$location', 'Cards', 'MercadoLibre', 'User', 'user', 'Auth',
 function($scope, $location, Cards, MercadoLibre, User, user, Auth ) {

    $scope.auth = Auth;
    console.log( $scope.auth.$getAuth() );

    console.log( "user: ", user );
    $scope.card = {};
    $scope.card.link = "";
    $scope.card.images = [];
    $scope.card.expires = false;
    $scope.card.approved = true;
    $scope.card.creator_name = user.displayName;
    $scope.card.creator_id = user.id;
    $scope.card.timestamp = new Date();

    $scope.save = function() {
        $scope.card.timestamp = Firebase.ServerValue.TIMESTAMP;
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

.controller('Example', ['$scope', '$firebase', '$firebaseArray', 'fbRef',
    function( $scope, $firebase, $firebaseArray, fbRef ) {
/*
    $scope.last_seen = '';
    $scope.cards = [];

    var pagination_len = 3;
    $scope.more = function (){
        $scope.cards = $firebaseArray( 
                            fbRef.child('card')
                            .orderByKey()
                            .startAt( $scope.last_seen )
                            .limitToFirst( pagination_len +1 ))
                            .$loaded().then(function(cards){
            
            if ( cards.length ) {
                $scope.last_seen = cards[ cards.length -1 ].$id;
            };
            if ( cards.length === pagination_len+1) {
                cards.pop();
            };
            $scope.cards = cards;

        });
    };
    */
  var cardTypes = [
    { image: 'https://pbs.twimg.com/profile_images/546942133496995840/k7JAxvgq.jpeg' },
    { image: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png' },
    { image: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg' },
  ];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0);

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  }

}])
.controller('CardCtrl', function($scope, TDCardDelegate) {
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.addCard();
  };
})

.controller('LoginController', ['$scope', '$firebase', '$location', 'User', '$firebase', 'fbURL',
 function($scope, $firebase, $location, User, $firebase, fbURL) {

    var ref = new Firebase( fbURL );
    ref.onAuth(function(authData) {
         if (authData !== null) {
            $scope.user = authData.facebook;
            console.log( $scope.user );
            User.save( $scope.user );
            $location.path('/');
        };
    });

    $scope.login = function() {
        ref.authWithOAuthRedirect("facebook", function(error, authData) { /* Redirect */ });
    };

}])

.controller('LogoutController', ['$scope', '$location', 'User', function($scope, $location, User) {

    User.logout();
    $location.path('/');
    
}])

;