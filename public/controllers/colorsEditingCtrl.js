var module = angular.module('adminApp');

module.controller('colorsEditingCtrl', function($scope) {
    var index = -1;
    $scope.colorsDraft = [];
    $scope.canSave = true;
    $scope.maxPermittedColors = 10;
    $scope.CheckSave = function() {
        if ($scope.colorsDraft.length > 0 && $scope.colorsDraft.length <= $scope.maxPermittedColors) {
            $scope.canSave = true;
        } else {
            $scope.canSave = false;
        }
    };

    $scope.$watch('ColorEditingStates.editingColorsMomentIndex', function() {
        index = $scope.$parent.ColorEditingStates.editingColorsMomentIndex;
        $scope.colorsDraft = $scope.$parent.ColorEditingActions.GetColorsMoment(index);
        $scope.CheckSave();
    });

    $scope.AddColor = function(index) {
        $scope.colorsDraft.push(index);
        $scope.CheckSave();
    };
    $scope.RemoveColor = function(index) {
        $scope.colorsDraft.splice(index, 1);
        $scope.CheckSave();
    };

    $scope.Save = function() {
        if ($scope.canSave) {
            $scope.$parent.ColorEditingActions.UpdateColorsMoment(index, $scope.colorsDraft);
            $scope.$parent.ColorEditingActions.HideColorsEditionBox();
        }
    };
    $scope.Discard = function() {
        $scope.$parent.ColorEditingActions.HideColorsEditionBox();
    };
});