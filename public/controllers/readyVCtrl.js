var module = angular.module('flareApp');

module.controller('readyVCtrl', function($scope, $interval, $timeout, $http, syncTimeFunctional, getColorFunctional) {
    //var socket = io.connect();
    var FetchedData = {
        start: syncTimeFunctional.GetUnreachableTime(),
        sequence: []
    };

    var lastSequenceHash = -1;

    /*socket.on('message', function (data) {
        data = JSON.parse(data);
        if (data.type == 'newStart') {
            FetchedData.start = data.data.newStart
        } else
        if (data.type == 'newSequence') {
            FetchedData.sequence = data.data.newSequence;
        }
    });*/

    var UpdateInfo = function() {
        $http.get('/catchUpdates', {params: {lastSequenceHash: lastSequenceHash}}).success(function (data) {
            if (angular.isDefined(data.newStart)) {
                FetchedData.start = data.newStart;
            }
            if (angular.isDefined(data.newSequence)) {
                FetchedData.sequence = data.newSequence;
            }
            console.log(data);
            lastSequenceHash = data.lastSequenceHash;
            $timeout(UpdateInfo, 1000);
        });
    };

    $scope.$on('ready', function(event, args) {
        UpdateInfo();
    });

    var SetColor = function(color) {
        $scope.sheetStyle.backgroundColor = color;
    };

    $scope.sheetStyle = {
        width: window.innerWidth + 'px',
        height: window.innerHeight + 'px',
        backgroundColor: getColorFunctional.GetRGBString(getColorFunctional.GetDefaultColor())
    };

    function ProcessSequence() {
        var defaultColor = getColorFunctional.GetDefaultColor();
        var ColorUpdater = function() {
            SetColor(getColorFunctional.GetCurrentColor(
                FetchedData.sequence,
                syncTimeFunctional.GetTime() - FetchedData.start,
                defaultColor,
                10
            ));
        };
        $interval(ColorUpdater, 10);
    }
    ProcessSequence();
});