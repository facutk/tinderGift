angular.module('tinderGiftApp', ['ngFacebook', 'firebase'])
.config(['$facebookProvider', function($facebookProvider) {
    $facebookProvider.setAppId('342947875890308').setPermissions(['email','user_friends']);
}])
.run(['$rootScope', '$window', function($rootScope, $window) {
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    $rootScope.$on('fb.load', function() {
        $window.dispatchEvent(new Event('fb.load'));
    });
}])
.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
    var ref = new Firebase("https://tindergift.firebaseio.com/");
    return $firebaseAuth(ref);
}])
.controller('myCtrl', ['$scope', '$facebook', 'Auth', '$firebase', function($scope, $facebook, Auth, $firebase) {
    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.status = $facebook.isConnected();
        if($scope.status) {
            $facebook.api('/me').then(function(user) {
                $scope.user = user;
                $scope.auth = Auth;
                $scope.authed = $scope.auth.$getAuth();
                
                var ref = new Firebase("https://tindergift.firebaseio.com");
                var authData = ref.getAuth();
                console.log("authData");
                console.log(authData);
                console.log( $scope.authed );
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
    };
    
    $scope.prueba = function() {
    
        var ref = new Firebase("https://tindergift.firebaseio.com");
        ref.authWithOAuthRedirect("facebook", function(error) {
            if (error) {
                console.log("Login Failed!", error);
            }
        });
        var authData = ref.getAuth();
        console.log("authData");
        console.log(authData);
    
    };
    
    $scope.chau = function() {
    
        var ref = new Firebase("https://tindergift.firebaseio.com");
        ref.unauth();
    
    };
    

}])
;