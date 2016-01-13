var module = angular.module("flareApp");

module.controller("flareAppCtrl", function($scope, $http, $interval, $location, getColorFunctional, syncTimeFunctional, $rootScope) {
    $scope.currentView = 'loading';
    var _iterations = 20;
    var _doneIterations = 0;
    $scope.personalID = 0;

    $scope.getProgress = function() {
        return _doneIterations / _iterations;
    };

    var SyncTime = function() {
        $scope.SharedData = {
            iterations: _iterations
        };
        syncTimeFunctional.SyncTime($scope.SharedData);
        var CheckForUpdates = function() {
            _doneIterations = $scope.SharedData.doneIterations;
            if ($scope.SharedData.calculated) {
                syncTimeFunctional.SetDifference($scope.SharedData.expectedDiff);
                $scope.currentView = 'ready';
                $interval.cancel(Checker);
                $rootScope.$broadcast('ready', {});
            }
        };
        var Checker = $interval(CheckForUpdates, 5);
    };
    SyncTime();
});