var module = angular.module('adminApp');

module.controller('loginFormCtrl', function($scope, $rootScope) {
    $scope.userID = 123123;
    $scope.StartEditing = function() {
        if ($scope.userId != '') {
            $rootScope.$broadcast('receivedUserID', {userID: $scope.userID});
        }
    }
});