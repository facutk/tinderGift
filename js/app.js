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
        .otherwise({
            redirectTo:'/'
        });
})

.controller('LandingCtrl', function($scope) {
    
})

.controller('ListCtrl', function($scope, Cards) {
    $scope.cards = Cards;
})
 
.controller('CreateCtrl', function($scope, $location, Cards) {
    $scope.save = function() {
        Cards.$add($scope.card).then(function(data) {
            $location.path('/');
        });
    };
})

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
