angular.module('tinderGiftApp', ['ngFacebook', 'firebase','ngRoute'])
.value('fbURL', 'https://tindergift.firebaseio.com/')
.config(['$facebookProvider', function($facebookProvider) {
    $facebookProvider.setAppId('342947875890308').setPermissions(['email','user_friends']);
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
          controller:'CreateCtrl',
          templateUrl:'detail.html'
    })
    .when('/friends', {
          controller:'myCtrl',
          templateUrl:'landing.html'
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
.controller('LandingCtrl', function($scope) {
    
})

.controller('ListCtrl', function($scope, Cards) {
    $scope.cards = Cards;
})
 
.controller('CreateCtrl', ['$scope', '$location', 'Cards', 'MercadoLibre', function($scope, $location, Cards, MercadoLibre) {
    $scope.card = {};
    $scope.card.images = [];
    $scope.card.approved = true;

    $scope.card.last_modified = new Date();

    var now = new Date();
    $scope.card.expires = new Date( now.setDate(now.getDate() + 5) );

    $scope.save = function() {
        Cards.$add($scope.card).then(function(data) {
            $location.path('/');
        });
    };
    $scope.addImage = function() {
        $scope.card.images.push( $scope.card.image );
        $scope.card.image = '';
    };
    $scope.removeImage = function(image) {
        var index = $scope.card.images.indexOf(image)
        $scope.card.images.splice( index, 1);  
    };
    $scope.checkML = function() {
        $scope.isMercadoLibre = ( $scope.card.link.indexOf("mercadolibre.com") > -1 );
    };
    $scope.fetch = function(){
        if ( $scope.card.link.indexOf("mercadolibre.com") > -1 ) {
            MercadoLibre.getInfo( $scope.card.link )
            .then( function( result ) {
                var data = result.data;
                if ( data.status == "ok") {
                    $scope.card.thumbnail = data.thumbnail;
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
;
