var module = angular.module('adminApp');

module.controller('previewLineCtrl', function($scope, getColorFunctional, $interval) {
    var sequence = [];
    var defaultColor = getColorFunctional.GetDefaultColor();
    var minProgressPosition = 46;
    var maxProgressPosition = 46 + 701 - 2;
    var songLength = 50000;
    $scope.started = false;
    var Player = null;
    $scope.audioFile = null;
    var audioObject = document.getElementById("idMainAudio");

    $scope.progressPosition = minProgressPosition;
    $scope.progressPositionStyle = {
        left: $scope.progressPosition + 'px'
    };
    $scope.progressPercent = 0;
    var FormatSecondsToTime = function(currentTime) {
        var ms = Math.floor(currentTime % 1000 / 10);
        if (ms < 10) {
            ms = '0' + ms;
        }
        currentTime = Math.floor(currentTime / 1000);
        var ss = currentTime % 60;
        if (ss < 10) {
            ss = '0' + ss;
        }
        currentTime = Math.floor(currentTime / 60);
        return currentTime + ':' + ss + '.' + ms;
    };
    $scope.GetPlayedTime = function() {
        var currentTime = Math.round($scope.progressPercent * songLength);
        return FormatSecondsToTime(currentTime);

    };
    $scope.GetTotalLength = function() {
        return FormatSecondsToTime(songLength);
    };

    $scope.mousePressed = false;

    $scope.colorsLine = [];
    $scope.colorByProgress = {
        backgroundColor: '#111'
    };

    $scope.$on('playFromTime', function(event, args) {
        var time = args.time;
        var progress = time / songLength;
        if (progress < 0) {
            progress = 0;
        }
        if (progress > 1) {
            progress = 1;
        }
        var position = minProgressPosition + (maxProgressPosition - minProgressPosition + 1) * progress;
        UpdateProgressByClient(position);
    });

    var UpdateByPlayer = function() {
        var newProgress = audioObject.currentTime * 1000 / songLength;
        $scope.UpdateProgressPosition(
            minProgressPosition + newProgress * (maxProgressPosition - minProgressPosition + 1),
            false
        );
        if (newProgress > 0.99999) {
            $scope.Actions.StopPlaying();
        }
    };

    var NormalizeProgress = function(val) {
        if (val < minProgressPosition) {
            val = minProgressPosition;
        }
        if (val > maxProgressPosition) {
            val = maxProgressPosition;
        }
        return val;
    };

    var ProgressToPercent = function(val) {
        return (NormalizeProgress(val) - minProgressPosition) / (maxProgressPosition - minProgressPosition + 1);
    };

    var UpdateProgressByClient = function(newPosition) {
        audioObject.currentTime = songLength / 1000 * ProgressToPercent(newPosition);
        $scope.UpdateProgressPosition(newPosition, false);
    };

    $scope.Actions = {
        StartPlaying: function() {
            if (audioObject) {
                $scope.started = true;
                audioObject.play();
                Player = $interval(
                    UpdateByPlayer,
                    10
                );
            }
        },
        StopPlaying: function() {
            if (audioObject) {
                $scope.started = false;
                audioObject.pause();
                $interval.cancel(Player);
            }
        },
        CreateMoment: function() {
            $scope.$parent.Actions.AddPart({start: Math.round($scope.progressPercent * songLength)});
        }
    };

    $scope.$on('newAudio', function(event, args) {
        if ($scope.started) {
            $scope.Actions.StopPlaying();
        }
        var newAudio = args.audioInfo;
        songLength = newAudio.file.$ngfDuration * 1000;
        $scope.audioFile = newAudio.file;
        $scope.UpdateProgressPosition(minProgressPosition, false);
        buildCanvasColors();
    });

    var UpdateColorByProgress = function() {
        if (sequence.length > 0) {
            var timeMoment = $scope.progressPercent * songLength;
            $scope.colorByProgress = {
                backgroundColor: getColorFunctional.GetCurrentColor(
                    sequence,
                    timeMoment,
                    defaultColor,
                    10
                )
            };
        }
    };

    $scope.UpdateProgressPosition = function(newVal, doApply) {
        if (typeof doApply === "undefined") {
            doApply = true;
        }
        $scope.progressPosition = NormalizeProgress(newVal);
        $scope.progressPositionStyle = {
            left: $scope.progressPosition + 'px'
        };
        $scope.progressPercent = ProgressToPercent($scope.progressPosition);

        UpdateColorByProgress();
        if (doApply) {
            $scope.$apply();
        }
    };

    var applyProgressChangeListener = function(element) {
        angular.element(element).bind('mousedown', function(event) {
            $scope.mousePressed = true;
            UpdateProgressByClient(event.clientX - 200);
            $scope.$apply();
        });
    };

    var buildCanvasColors = function() {
        var canvas = document.getElementById("previewLineCanvas");
        var context = canvas.getContext('2d');
        sequence = $scope.$parent.Converters.ConvertMomentsToSequence();
        for (var positionX = 0; positionX <= canvas.width; positionX++) {
            var timeMoment = positionX/canvas.width * songLength;
            $scope.colorsLine[positionX] = getColorFunctional.GetCurrentColor(
                sequence,
                timeMoment,
                defaultColor,
                10
            );
            context.fillStyle = $scope.colorsLine[positionX];
            context.fillRect(positionX, 0, positionX, canvas.height);
        }
        UpdateColorByProgress();
    };

    $scope.$on('updatePreviewLine', function(event, args) {
        buildCanvasColors();
    });

    $scope.$on('stopEditing', function(event, args) {
        UpdateProgressByClient(minProgressPosition);
        $scope.Actions.StopPlaying();
    });

    $scope.$on('buildPreviewLine', function(event, args) {
        $scope.UpdateProgressPosition(minProgressPosition, false);
        buildCanvasColors();
        applyProgressChangeListener(document.getElementById("previewLineCanvas"));
        applyProgressChangeListener(document.getElementById("idPreviewLineProgressMainBox"));
        applyProgressChangeListener(document.getElementById("idPreviewLineProgressBoxCenter"));

        angular.element(document).bind('mouseup', function(event) {
            if ($scope.mousePressed) {
                $scope.mousePressed = false;
            }
        });

        angular.element(document).bind('mousemove', function(event) {
            if ($scope.mousePressed) {
                UpdateProgressByClient(event.clientX - 200);
                $scope.$apply();
            }
        });
    });
});