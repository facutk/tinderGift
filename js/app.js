angular.module('tinderGiftApp', ['ngFacebook', 'firebase','ngRoute', 'xeditable', 'ui.bootstrap'])
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
        controller:'LoginCtrl',
        templateUrl:'login.html',
    })
    .when('/landing', {
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
    .when('/example', {
          controller:'Example',
          templateUrl:'example.html'
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
 
.controller('CreateCtrl', ['$scope', '$location', 'Cards', 'MercadoLibre', '$facebook',
 function($scope, $location, Cards, MercadoLibre, $facebook) {
/*
    $scope.$on('fb.auth.authResponseChange', function() {
      $scope.status = $facebook.isConnected();
      if($scope.status) {
        $facebook.api('/me').then(function(user) {
          $scope.user = user;
        });
      }
    });
*/
    $scope.isLoggedIn = false;
    $scope.login = function() {
        $facebook.login().then(function() {
            $scope.refresh();
        });
    }
    $scope.refresh = function () {
        $facebook.api("/me").then( 
            function(response) {
                $scope.welcomeMsg = "Welcome " + response.name;
                $scope.isLoggedIn = true;
            },
            function(err) {
                $scope.welcomeMsg = "Please log in";
        });
    }
  
    $scope.refresh();

    $scope.card = {};
    $scope.card.link = "";
    $scope.card.images = [];
    $scope.card.expires = false;
    $scope.card.approved = true;
    $scope.card.creator = "Facu Tkaczyszyn";

    $scope.card.last_modified = new Date();

    $scope.save = function() {
        Cards.$add($scope.card).then(function(data) {
            $location.path('/');
        });
    };

    $scope.addImage = function() {
        $scope.card.images.push( $scope.newImage );
        $scope.newImage = '';
    };
    $scope.removeImage = function(image) {
        var index = $scope.card.images.indexOf(image)
        $scope.card.images.splice( index, 1);  
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

.controller('Example', ['$scope', '$facebook', '$firebase', 
 function($scope, $facebook, $firebase) {

    $scope.$on('fb.auth.authResponseChange', function() {
      $scope.status = $facebook.isConnected();
      if($scope.status) {
        $facebook.api('/me').then(function(user) {
          $scope.user = user;
        });
      }
    });

    $scope.loginToggle = function() {
      if($scope.status) {
        $facebook.logout();
      } else {
        $facebook.login();
      }
    };

    $scope.getFriends = function() {
      if(!$scope.status) return;
      $facebook.cachedApi('/me/friends').then(function(friends) {
        $scope.friends = friends.data;
      });
    }

}])

.controller('LoginCtrl', ['$scope', '$facebook', '$firebase', '$timeout','$window',
 function($scope, $facebook, $firebase, $timeout, $window) {

    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.status = $facebook.isConnected();
        if($scope.status) {
            $facebook.api('/me').then(function(user) {
                $scope.user = user;
            });
        }
    });

    $scope.isLoggedIn = false;
    $scope.login = function() {
        $facebook.login().then(function() {
            $scope.refresh();
        });
    }
    $scope.refresh = function () {
        $facebook.api("/me").then( 
            function(response) {
                $scope.welcomeMsg = "Welcome " + response.name;
                $scope.isLoggedIn = true;
            },
            function(err) {
                $scope.welcomeMsg = "Please log in";
        });
    }
  
    $scope.refresh();

    /*
        No quiero agregar este chequeo cabeza, pero no le encuentro la vuelta para que cargue siempre
        el SDK de facebook.
        A veces carga, a veces no... medio que hace lo que quiere.
        Lo que defino aca es un timeout de 5 segundos.. si no cargo nada, ni por bien ni por mal,
        destruyo toda la pagina y vuelvo a empezar
    */
    $timeout(function() {
        console.log( "timeout, verificando welcomeMsg " );
        if ( !$scope.welcomeMsg ) {
            console.log( "welcomeMsg no encontrado! destruyendo ventana" );
            $window.location.reload();
        };
    }, 15000);
    
}])

;
