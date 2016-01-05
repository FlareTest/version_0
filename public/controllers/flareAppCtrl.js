var module = angular.module("flareApp");

module.controller("flareAppCtrl", function($scope, $http, $interval, $location, getColorFunctional, syncTimeFunctional) {
    $scope.currentView = 'loading';
    var _iterations = 20;
    var _doneIterations = 0;

    $scope.getProgress = function() {
        return _doneIterations / _iterations;
    };

    var SyncTime = function() {
        var SharedData = {
            iterations: _iterations
        };
        syncTimeFunctional.SyncTime(SharedData);
        var CheckForUpdates = function() {
            _doneIterations = SharedData.doneIterations;
            if (SharedData.calculated) {
                syncTimeFunctional.SetDifference(SharedData.expectedDiff);
                $scope.currentView = 'ready';
                $interval.cancel(Checker);
            }
        };
        var Checker = $interval(CheckForUpdates, 5);
    };
    SyncTime();
});