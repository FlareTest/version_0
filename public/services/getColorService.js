var module = angular.module('getColorService', []);

module.factory('getColorFunctional', function() {
    var defaultColor = {
        r: 92,
        g: 184,
        b: 92
    };

    this.GetMixedRGBString = function(val1, val2, coof) {
        var r = Math.round((val1.r * coof + val2.r * (1 - coof)));
        var g = Math.round((val1.g * coof + val2.g * (1 - coof)));
        var b = Math.round((val1.b * coof + val2.b * (1 - coof)));

        return "rgb(" + r + "," + g + "," + b + ")";
    };

    this.GetRGBString = function(val) {
        //console.log(val);
        return "rgb(" + val.r + "," + val.g + "," + val.b + ")";
    };

    this.GetDefaultColor = function() {
        return defaultColor;
    };

    this.GetCurrentColor = function(sequence, timePassed, defaultColor, basicTransition) {
        var lastAssignedColor = defaultColor;
        var lastTransitionLength = basicTransition;
        //console.log(defaultColor);
        //console.log(lastTransitionLength);
        if (timePassed < 0) {
            return this.GetRGBString(defaultColor);
        }
        for (var i = 0; i < sequence.length; i++) {
            //console.log(sequence[i]);
            if (timePassed < sequence[i].duration) {
                if (timePassed > lastTransitionLength) {
                    return this.GetRGBString(sequence[i].color);
                } else {
                    return this.GetMixedRGBString(
                        lastAssignedColor,
                        sequence[i].color,
                        1 - timePassed / lastTransitionLength
                    );
                }
            }
            timePassed -= sequence[i].duration;
            lastTransitionLength = sequence[i].transition;
            lastAssignedColor = sequence[i].color;
        }
        return this.GetRGBString(defaultColor);
    };
    return this;
});