var module = angular.module('adminApp');

module.controller('adminAppCtrl', function($scope) {
    $scope.WorkProcess = {
        state: 'loginForm'
    };
    $scope.$on('receivedUserID', function(event, args) {
        $scope.WorkProcess.state = 'createShow';
    });
});