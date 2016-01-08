var module = angular.module('flareApp');

module.controller('readyVCtrl', function($scope, $interval, syncTimeFunctional, getColorFunctional) {
    var socket = io.connect({'connect timeout': 1000});
    var FetchedData = {
        start: syncTimeFunctional.GetUnreachableTime(),
        sequence: []
    };

    socket.on('message', function (data) {
        data = JSON.parse(data);
        if (data.type == 'newStart') {
            FetchedData.start = data.data.newStart
        } else
        if (data.type == 'newSequence') {
            FetchedData.sequence = data.data.newSequence;
        }
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