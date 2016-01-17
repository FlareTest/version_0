var module = angular.module('flareApp');

module.controller('readyVCtrl', function($window, $scope, $interval, $timeout, $http, syncTimeFunctional, getColorFunctional) {
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
        var info = {
            atStart: Date.now()
        };
        var SuccessfulResponse = function (data) {
            data = data.data;
            if (angular.isDefined(data.newStart)) {
                FetchedData.start = data.newStart;
            }
            if (angular.isDefined(data.newSequence)) {
                FetchedData.sequence = data.newSequence;
            }
            if (angular.isDefined(data.personalID)) {
                $scope.$parent.personalID = data.personalID;
            }
            //console.log(data);
            lastSequenceHash = data.lastSequenceHash;
            info.time = data.currentTime;
            info.atFinish = Date.now();
            syncTimeFunctional.CreateCheckPoint($scope.$parent.SharedData, info);
            syncTimeFunctional.SetDifference($scope.$parent.SharedData.expectedDiff);
            $timeout(UpdateInfo, 1000);
        };
        var UnsuccessfulResponse = function() {
            $timeout(UpdateInfo, 1000);
        };

        $http.get('/catchUpdates', {params: {
            lastSequenceHash: lastSequenceHash,
            personalID: $scope.$parent.personalID
        }}).then(
            SuccessfulResponse,
            UnsuccessfulResponse
        );
    };

    $scope.$on('ready', function(event, args) {
        UpdateInfo();
    });
    
    var SetColor = function(color) {
        $scope.sheetStyle.backgroundColor = color;
    };

    $scope.sheetStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: getColorFunctional.GetRGBString(getColorFunctional.GetDefaultColor())
    };

    /*angular.element($window).bind('resize', function() {
        $scope.sheetStyle.width = 2000 + 'px';
        $scope.sheetStyle.height = 2000 + 'px';
    });*/

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
        $interval(ColorUpdater, 50);
    }
    ProcessSequence();
});