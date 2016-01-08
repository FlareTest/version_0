var arrayHashing = require('./arrayHashing');

module.exports = {
    createClientWorker: function(app) {
        var savedStart = Date.now() - 0 + 100000000000;
        var savedSequence = [];
        var savedSequenceHash = 0;
        //var _sockets = [];
        var totalConnections = 0;
        var totalDisconnections = 0;

        app.get('/catchUpdates', function(req, res) {
            var data = {};
            data.newStart = savedStart;
            if (req.query.lastSequenceHash != savedSequenceHash) {
                data.newSequence = savedSequence;
            }
            data.lastSequenceHash = savedSequenceHash;
            res.json(data);
        });


        this.updateStart = function(newStart) {
            savedStart = newStart;
        };

        this.updateSequence = function(newSequence) {
            savedSequence = newSequence;
            savedSequenceHash = arrayHashing.getHash(savedSequence);
        };

        this.statistics = function() {
            return {
                totalConnections: totalConnections,
                totalDisconnections: totalDisconnections,
                connected: totalConnections - totalDisconnections
            }
        };

        this.startTimeAssigned = function() {
            if (savedStart > Date.now() - 0 + 50000000000) {
                return false;
            }
            return true;
        };

        this.getStartTime = function() {
            var date = new Date(savedStart);
            return {
                startHH: date.getHours(),
                startMM: date.getMinutes(),
                startSS: date.getSeconds()
            }
        };

        return this;
    }
};