var module = angular.module('flareApp');

module.controller('loadingVCtrl', function ($scope, $window, $interval, getColorFunctional) {
    var boxWidth = 0;
    var Rebuild = function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var screenCenterX = Math.round(width / 2);
        var screenCenterY = Math.round(height / 2);

        boxWidth = Math.round(width * 0.75);
        var boxHeight = 100;
        var boxPositionX = Math.round(screenCenterX - boxWidth / 2);
        var boxPositionY = Math.round(screenCenterY - boxHeight / 2);

        var headerWidth = Math.round(width * 0.60);
        var headerHeight = 150;
        var headerPositionX = Math.round(screenCenterX - headerWidth / 2);
        var headerPositionY = boxPositionY - 200;
        var headerFontSize = headerHeight / 2;

        $scope.loadingScreenStyle = {
            backgroundColor: getColorFunctional.GetRGBString(getColorFunctional.GetDefaultColor()),
            width: window.innerWidth + 'px',
            height: window.innerHeight + 'px',
            overflow: 'hidden'
        };

        $scope.headerBoxContainerStyle = {
            position: 'absolute',
            top: headerPositionY + 'px',
            left: headerPositionX + 'px',
            width: headerWidth + 'px',
            height: headerHeight + 'px',
            display: 'block'
        };

        $scope.headerBoxInnerStyle = {
            textAlign: 'center',
            color: '#555',
            fontFamily: 'Tahoma, Verdana',
            fontSize: headerFontSize + 'pt'
        };

        $scope.loadingBoxContainerStyle = {
            position: 'absolute',
            top: boxPositionY + 'px',
            left: boxPositionX + 'px',
            border: '#777 5px solid',
            width: boxWidth + 'px',
            height: boxHeight + 'px',
            overflow: 'hidden',
            display: 'block'
        };

        $scope.loadingBoxInnerStyle = {
            width: '0px',
            height: boxHeight + 'px',
            backgroundColor: '#999'
        };
    };

    Rebuild();
    angular.element($window).bind('resize', Rebuild);

    var UpdateProgress = function() {
        $scope.loadingBoxInnerStyle.width = Math.round($scope.$parent.getProgress() * boxWidth) + 'px';
    };

    $interval(UpdateProgress, 10);
});