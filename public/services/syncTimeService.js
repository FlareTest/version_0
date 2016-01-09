var module = angular.module('syncTimeService', []);

module.factory('syncTimeFunctional', function($http) {
    var _calculateExpectedDiff = function(temporaryData) {
        var calcRatioToValue = function(value) {
            var sum = 0;
            for (var i = 0; i < temporaryData.differences.length; i++) {
                sum += Math.abs(value - temporaryData.differences[i].diff) * temporaryData.differences[i].half;
            }
            return sum;
        };

        var minimalRatio = calcRatioToValue(temporaryData.differences[0].diff);
        var optimalDiff = temporaryData.differences[0].diff;

        for (var i = 1; i < temporaryData.differences.length; i++) {
            var tempRatio = calcRatioToValue(temporaryData.differences[i].diff);
            if (tempRatio < minimalRatio) {
                minimalRatio = tempRatio;
                optimalDiff = temporaryData.differences[i].diff;
            }
        }

        temporaryData.calculated = true;
        temporaryData.expectedDiff = optimalDiff;
    };

    var _SyncTime = function(atStart, temporaryData) {
        var SuccessfulResponse = function (response) {
            var serverTime = response.data.time;
            var atFinish = Date.now();
            var half = (atFinish - atStart) / 2;
            var expectedServerTime = atStart + half;
            var diff = serverTime - expectedServerTime;
            temporaryData.differences.push({
                diff: diff,
                half: half
            });
            temporaryData.doneIterations++;
            if (temporaryData.doneIterations == temporaryData.iterations) {
                _calculateExpectedDiff(temporaryData);
            } else {
                _SyncTime(Date.now(), temporaryData);
            }
        };
        var UnsuccessfulResponse = function() {
            _SyncTime(Date.now(), temporaryData);
        };

        $http.get('/currentTime').then(
            SuccessfulResponse,
            UnsuccessfulResponse
        );
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
    this.CreateCheckPoint = function(temporaryData, info) {
        var serverTime = info.time;
        var atFinish = info.atFinish;
        var atStart = info.atStart;
        var half = (atFinish - atStart) / 2;
        var expectedServerTime = atStart + half;
        var diff = serverTime - expectedServerTime;
        if (temporaryData.differences.length > 0){
            temporaryData.differences.splice(0, 1);
        }
        temporaryData.differences.push({
            diff: diff,
            half: half
        });
        _calculateExpectedDiff(temporaryData);
    };
    return this;
});