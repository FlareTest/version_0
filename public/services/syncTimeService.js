var module = angular.module('syncTimeService', []);

module.factory('syncTimeFunctional', function($http) {
    var _calculateExpectedDiff = function(temporaryData) {
        var calcRatioToValue = function(value) {
            var sum = 0;
            for (var i = 0; i < temporaryData.differences.length; i++) {
                sum += Math.abs(value - temporaryData.differences[i]);
            }
            return sum;
        };

        var minimalRatio = calcRatioToValue(temporaryData.differences[0]);
        var optimalDiff = temporaryData.differences[0];

        for (var i = 1; i < temporaryData.differences.length; i++) {
            var tempRatio = calcRatioToValue(temporaryData.differences[i]);
            if (tempRatio < minimalRatio) {
                minimalRatio = tempRatio;
                optimalDiff = temporaryData.differences[i];
            }
        }

        temporaryData.calculated = true;
        temporaryData.expectedDiff = optimalDiff;
    };

    var _SyncTime = function(atStart, temporaryData) {
        $http.get('/currentTime').success(function (response) {
            var serverTime = response.time;
            var atFinish = Date.now();
            var half = (atFinish - atStart) / 2;
            var expectedServerTime = atStart + half;
            var diff = serverTime - expectedServerTime;
            temporaryData.differences.push(diff);
            atStart = Date.now();
            temporaryData.doneIterations++;
            if (temporaryData.doneIterations == temporaryData.iterations) {
                 _calculateExpectedDiff(temporaryData);
            } else {
                _SyncTime(Date.now(), temporaryData);
            }
        });
    };
    this.SyncTime = function(temporaryData) {
        temporaryData.differences = [];
        temporaryData.doneIterations = 0;
        temporaryData.calculated = false;
        _SyncTime(Date.now(), temporaryData, 0);
    };
    var timeDiff = 0;
    this.SetDifference = function(difference) {
        timeDiff = difference;
    };
    this.GetTime = function() {
        return Date.now() + timeDiff;
    };
    this.GetUnreachableTime = function() {
        return Date.now() - 0 + 100000000000;
    };
    return this;
});