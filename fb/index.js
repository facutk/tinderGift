/*
 * Authored by  AlmogBaku
 *              almog.baku@gmail.com
 *              http://www.almogbaku.com/
 *
 * 27/12/14 21:01
 */

angular.module('myApp', ['ngFacebook'])
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

.controller('fbCtrl', ['$scope', '$facebook', function($scope, $facebook) {
}])

.controller('myCtrl', ['$scope', '$facebook', function($scope, $facebook) {
    $scope.$on('fb.auth.authResponseChange', function() {
        $scope.status = $facebook.isConnected();
        if($scope.status) {
            $facebook.api('/me').then(function(user) {
                $scope.user = user;
                $scope.welcome = user.name;
            }, function(err) {
                $scope.welcome = "Please log in";
            });
        }
    });
    
    $scope.login = function () {
        $facebook.login();
    };

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
;