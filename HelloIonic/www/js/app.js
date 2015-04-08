// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])
.controller("ExampleController", function($scope, $cordovaBarcodeScanner) {
 
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            alert(imageData.text);
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };
 
})
.controller('FlashylightController', function($scope, $ionicPlatform, $cordovaFlashlight) {
  $ionicPlatform.ready(function() {
      $cordovaFlashlight.available().then(function(availability) {
        $scope.available = availability; // is available
        
        $scope.on = function(){
          $cordovaFlashlight.switchOn()
            .then(
              function (success) {  },
              function (error) {  });
        };
        $scope.off = function() {
          $cordovaFlashlight.switchOff()
            .then(
              function (success) { },
              function (error) {  });
        };

        }, function () {
        // unavailable
      });
  });
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
