var arrayHashing = require('./arrayHashing');

module.exports = {
    createClientWorker: function(app) {
        var savedStart = Date.now() - 0 + 100000000000;
        var savedSequence = [];
        var savedSequenceHash = 0;
        //var _sockets = [];
        var lastUpdateByID = [];

        app.get('/catchUpdates', function(req, res) {
            var data = {};
            data.newStart = savedStart;
            if (req.query.lastSequenceHash != savedSequenceHash) {
                data.newSequence = savedSequence;
            }
            if (req.query.personalID != null) {
                lastUpdateByID[req.query.personalID] = Date.now();
            }
            data.lastSequenceHash = savedSequenceHash;
            data.currentTime = Date.now();
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
            var active = 0;
            var now = Date.now();
            console.log('start');
            console.log('length ' + lastUpdateByID.length);
            lastUpdateByID.forEach(function(val, key) {
                console.log(val + " " + key);
                if (val + 5000 > now) {
                    active++;
                }
            });
            return {
                active: active
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