var module = angular.module('adminApp');

module.controller('uploadAudioCtrl', function($scope, Upload, $rootScope) {
    $scope.Close = function() {
        if ($scope.audioInfo.file) {
            $rootScope.$broadcast('newAudio', {
                audioInfo: $scope.audioInfo
            });
        }
        $scope.$parent.Audio.uploadingAudioModeOff = true;
    };
    $scope.audioFile = null;
    $scope.audioInfo = {
        file: null,
        duration: 0,
        name: 'unknown'
    };
    $scope.UpdateAudio = function(file) {
        $scope.$parent.Audio.selected = true;
        $scope.audioInfo.file = file;
        $scope.audioInfo.duration = Math.round(file.$ngfDuration);
        $scope.audioInfo.name = file.name;
    };
    $scope.uploadAudioFile = function(file, errFiles) {
        $scope.UpdateAudio(file);
    }
});