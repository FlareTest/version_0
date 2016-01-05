var module = angular.module('adminApp');

module.controller('createShowCtrl', function($scope, $http, $rootScope, syncTimeFunctional, $interval) {
    $scope.States = {
        userID: 0,
        lastError: "",
        started: false,
        editMode: false,
        moments: [],
        availableColors: [],
        savingData: false,
        blockingGetRequests: 0,
        currentTime: new Date(syncTimeFunctional.GetTime()),
        startTime: {
            startHH: 0,
            startMM: 0,
            startSS: 0
        }
    };
    $interval(function() {
        $scope.States.currentTime = new Date(syncTimeFunctional.GetTime());
    }, 10);

    var Drafts = {
        momentsDraft: []
    };

    $scope.Actions = {
        AssignStartAsNow: function() {
            $scope.States.startTime.startHH = $scope.States.currentTime.getHours();
            $scope.States.startTime.startMM = $scope.States.currentTime.getMinutes();
            $scope.States.startTime.startSS = $scope.States.currentTime.getSeconds();
        },
        StartShow: function () {
            if ($scope.Validators.CheckShowStartTime()) {
                var startDate = $scope.States.currentTime;
                startDate.setHours($scope.States.startTime.startHH);
                startDate.setMinutes($scope.States.startTime.startMM);
                startDate.setSeconds($scope.States.startTime.startSS);
                startDate.setMilliseconds(0);
                console.log(startDate);
                console.log(startDate.getTime());
                $http.post('/newStart', {
                    userID: $scope.States.userID,
                    data: {
                        newStart: startDate.getTime()
                    }
                });
                $scope.States.started = true;
            }
        },

        StopShow: function () {
            $http.post('/newStart', {
                userID: $scope.States.userID,
                data: {
                    newStart: syncTimeFunctional.GetUnreachableTime()
                }
            });
            $scope.States.started = false;
        },

        EditShow: function () {
            $rootScope.$broadcast('buildPreviewLine', {});
            Drafts.momentsDraft = JSON.parse(JSON.stringify($scope.States.moments));
            $scope.States.editMode = true;
        },

        SaveShow: function () {
            if ($scope.Validators.CheckWholeData()) {
                var SuccessfulSave = function() {
                    $rootScope.$broadcast('stopEditing', {});
                    $scope.States.editMode = false;
                    $scope.States.lastError = "";
                    $scope.States.savingData = false;
                };
                var UnsuccessfulSave = function() {
                    $scope.States.lastError = "Unable to save, try on more time";
                    $scope.States.savingData = false;
                };

                $scope.States.savingData = true;
                $http.post('/newMoments', {
                    userID: $scope.States.userID,
                    data: {
                        moments: $scope.States.moments
                    }
                }).then(SuccessfulSave, UnsuccessfulSave);
            }
        },

        DiscardShow:  function () {
            $rootScope.$broadcast('stopEditing', {});
            $scope.States.moments = JSON.parse(JSON.stringify(Drafts.momentsDraft));
            $scope.States.editMode = false;
            $scope.States.lastError = "";
        },

        UpdateSequence: function () {
            if ($scope.Validators.CheckWholeData()) {
                $rootScope.$broadcast('updatePreviewLine', {});
            }
        },

        AddPart: function (Part) {
            if (angular.isDefined(Part)) {
                var inserted = false;
                if (Part.start) {
                    for (var index = 0; index < $scope.States.moments.length; index++) {
                        if ($scope.States.moments[index].start >= Part.start) {
                            $scope.States.moments.splice(index, 0, {
                                speed: Part.speed || 50,
                                colors: Part.colors || [0],
                                start: Part.start || 0,
                                transition: Part.transition || 0
                            });
                            inserted = true;
                            break;
                        }
                    }
                }
                if (!inserted) {
                    $scope.States.moments.push({
                        speed: Part.speed || 50,
                        colors: Part.colors || [0],
                        start: Part.start || 0,
                        transition: Part.transition || 0
                    });
                }
            } else {
                $scope.States.moments.push({
                    speed: 50,
                    colors: [0],
                    start: 0,
                    transition: 0
                });
            }
        },

        RemovePart: function (index) {
            if (index > 0) {
                $scope.States.moments.splice(index, 1);
            }
        },

        PlayFromTime: function(index) {
            if (!isNaN($scope.States.moments[index].start)) {
                $rootScope.$broadcast('playFromTime', {time: $scope.States.moments[index].start});
            }
        },

        SyncTime: function() {
            var SharedData = {
                iterations: 20
            };
            $scope.States.blockingGetRequests++;
            syncTimeFunctional.SyncTime(SharedData);
            var CheckForUpdates = function() {
                if (SharedData.calculated) {
                    syncTimeFunctional.SetDifference(SharedData.expectedDiff);
                    $scope.States.blockingGetRequests--;
                    $interval.cancel(Checker);
                }
            };
            var Checker = $interval(CheckForUpdates, 5);
        }
    };

    $scope.Converters = {
        ConvertMomentsToSequence: function() {
            var sequence = [];
            var moments = $scope.States.moments;
            for (var index = 0; index < moments.length; index++) {
                var nextStart = 1000000;
                if (index + 1 < moments.length) {
                    nextStart = moments[index + 1].start;
                }
                var timeLeft = nextStart - moments[index].start;
                var colorIndex = 0;
                while (timeLeft > 0) {
                    var currentSpot = Math.min(timeLeft, moments[index].speed);
                    sequence.push({
                        duration: currentSpot,
                        transition: moments[index].transition,
                        color: $scope.States.availableColors[moments[index].colors[colorIndex]]
                    });
                    timeLeft -= currentSpot;
                    colorIndex = (colorIndex + 1) % moments[index].colors.length;
                }
            }
            return sequence;
        }
    };

    $scope.ColorEditingStates = {
        editingColorsModeOff: true,
        editingColorsMomentIndex: -1
    };
    $scope.ColorEditingActions = {
        ShowColorsEditionBox: function(index) {
            $scope.ColorEditingStates.editingColorsModeOff = false;
            $scope.ColorEditingStates.editingColorsMomentIndex = index;
        },
        HideColorsEditionBox: function() {
            $scope.ColorEditingStates.editingColorsModeOff = true;
            $scope.ColorEditingStates.editingColorsMomentIndex = -1;
        },
        GetColorsMoment: function(index) {
            if (index >= 0 && index < $scope.States.moments.length) {
                return JSON.parse(JSON.stringify($scope.States.moments[index].colors));
            } else {
                return [];
            }
        },
        UpdateColorsMoment: function(index, newVal) {
            $scope.States.moments[index].colors = JSON.parse(JSON.stringify(newVal));
        }
    };

    $scope.GetSquareInner = function(val) {
        if (angular.isDefined($scope.States.availableColors) && angular.isDefined($scope.States.availableColors[val])) {
            return {
                backgroundColor: 'rgb('
                + $scope.States.availableColors[val].r + ', '
                + $scope.States.availableColors[val].g + ', '
                + $scope.States.availableColors[val].b + ')',
                width: "20px",
                height: "20px"
            };
        } else {
            return {
                width: "20px",
                height: "20px"
            }
        }
    };

    $scope.Validators = {
        IsSpeedCorrect: function(index) {
            var val = $scope.States.moments[index].speed;
            if (isNaN(val) || val - 0 < 50 || val - 0 > 9999) {
                return false;
            }
            return true;
        },

        IsTransitionCorrect: function(index) {
            var val = $scope.States.moments[index].transition;
            if (isNaN(val) || val - 0 < 0 || val - 0 > 9999) {
                return false;
            }
            return true;
        },

        IsStartTimeCorrect: function(index) {
            var val = $scope.States.moments[index].start;
            if (isNaN(val) || val - 0 < 0 || val - 0 > 3600000) {
                return false;
            }
            if (index > 0) {
                var pVal = $scope.States.moments[index - 1].start;
                //console.log(val + ' '+ pVal + ' ' + index);
                //console.log(pVal + 10);
                if (!isNaN(pVal) && pVal - 0 + 50 > val) {
                    return false;
                }
                //console.log(val + ' '+ pVal + ' ' + index);
            }
            return true;
        },

        IsColorsAmountCorrect: function(index) {
            return ($scope.States.moments[index].colors.length > 0
                && $scope.States.moments[index].colors.length <= 10);
        },

        CheckSpeed: function(index) {
            return !$scope.Validators.IsSpeedCorrect(index) ? {background: '#ffcccc'} : {};
        },

        CheckTransition: function(index) {
            return !$scope.Validators.IsTransitionCorrect(index) ? {background: '#ffcccc'} : {};
        },

        CheckStartTime: function(index) {
            return !$scope.Validators.IsStartTimeCorrect(index) ? {background: '#ffcccc'} : {};
        },

        CheckWholeData: function() {
            var data = $scope.States.moments;
            for (var index = 0; index < data.length; index++) {
                if (!$scope.Validators.IsSpeedCorrect(index)) {
                    $scope.States.lastError = 'Incorrect speed';
                    return false;

                }
                if (!$scope.Validators.IsTransitionCorrect(index)) {
                    $scope.States.lastError = 'Incorrect transition';
                    return false;

                }
                if (!$scope.Validators.IsStartTimeCorrect(index)) {
                    $scope.States.lastError = 'Incorrect start time';
                    return false;
                }
                if (!$scope.Validators.IsColorsAmountCorrect(index)) {
                    $scope.States.lastError = 'Incorrect amount of colors';
                    return false;
                }
            }
            if (data.length == 0) {
                $scope.States.lastError = "Cannot be empty";
                return false;
            }
            $scope.States.lastError = "";
            return true;
        },

        IsHHCorrect: function(val) {
            if (isNaN(val) || val < 0 || val > 23) {
                return false;
            }
            return true;
        },

        IsMMCorrect: function(val) {
            if (isNaN(val) || val < 0 || val > 59) {
                return false;
            }
            return true;
        },

        IsSSCorrect: function(val) {
            if (isNaN(val) || val < 0 || val > 59) {
                return false;
            }
            return true;
        },

        CheckHH: function(val) {
            return !$scope.Validators.IsHHCorrect(val) ? {background: '#ffcccc'} : {};
        },

        CheckMM: function(val) {
            return !$scope.Validators.IsMMCorrect(val) ? {background: '#ffcccc'} : {};
        },

        CheckSS: function(val) {
            return !$scope.Validators.IsSSCorrect(val) ? {background: '#ffcccc'} : {};
        },

        CheckShowStartTime: function() {
            if (!$scope.Validators.IsHHCorrect($scope.States.startTime.startHH)) {
                $scope.States.lastError = 'Incorrect "hours" in start time';
                return false;
            }
            if (!$scope.Validators.IsMMCorrect($scope.States.startTime.startMM)) {
                $scope.States.lastError = 'Incorrect "minutes" in start time';
                return false;
            }
            if (!$scope.Validators.IsSSCorrect($scope.States.startTime.startSS)) {
                $scope.States.lastError = 'Incorrect "seconds" in start time';
                return false;
            }
            $scope.States.lastError = '';
            return true;
        }
    };

    $scope.Audio = {
        selected: false,
        uploadingAudioModeOff: true,
        ShowUploadBox: function() {
            $scope.Audio.uploadingAudioModeOff = false;
        }
    };

    var GetServerData = function() {
        $scope.States.blockingGetRequests = 3;
        $http.get('/availableColors/').success(function (response) {
            $scope.States.availableColors = response.colors;
            $scope.States.blockingGetRequests--;
        });
        $http.get('/storedMoments', {params: {userID: $scope.States.userID}}).success(function (response) {
            $scope.States.moments = response.moments;
            $scope.States.blockingGetRequests--;
        });
        $http.get('/startTime', {params: {userID: $scope.States.userID}}).then(
            function (response) {
                console.log(response.data.startTime);
                $scope.States.startTime = response.data.startTime;
                $scope.States.started = true;
                $scope.States.blockingGetRequests--;
            },
            function (response) {
                $scope.States.blockingGetRequests--;
            }
        );
    };

    $scope.$on('receivedUserID', function(event, args) {
        $scope.States.userID = args.userID;
        GetServerData();
    });


    /*
    $scope.States.moments = [
        {
            speed: 50,
            transition: 0,
            colors: [15, 6, 14, 15, 14, 6, 5, 15, 5],
            start: 0
        },
        {
            speed: 1500,
            transition: 50,
            colors: [7, 8, 10, 8, 10, 7, 10, 8],
            start: 10000
        },
        {
            speed: 1500,
            transition: 1500,
            colors: [13, 14, 1, 14, 13, 15, 1],
            start: 20000
        }
    ];*/
});