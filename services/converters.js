var fs = require('fs');

var availableColors = [];
fs.readFile('./data/availableColors.json', function(err, data) {
    availableColors = JSON.parse(data).colors;
});

module.exports = {
    ConvertMomentsToSequence: function(moments) {
        var sequence = [];
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
                    color: availableColors[moments[index].colors[colorIndex]]
                });
                timeLeft -= currentSpot;
                colorIndex = (colorIndex + 1) % moments[index].colors.length;
            }
        }
        return sequence;
    }
};