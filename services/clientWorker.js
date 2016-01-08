module.exports = {
    createClientWorker: function(app) {
        var savedStart = Date.now() - 0 + 100000000000;
        var savedStartAt = 0;
        var savedSequence = [];
        var savedSequenceAt = 0;
        //var _sockets = [];
        var totalConnections = 0;
        var totalDisconnections = 0;

        app.get('/catchUpdates', function(req, res) {
            var data = {};
            if (req.query.lastUpdateTime < savedStartAt) {
                data.newStart = savedStart;
            }
            if (req.query.lastUpdateTime < savedSequenceAt) {
                data.newSequence = savedSequence;
            }
            data.lastUpdateTime = Math.max(req.query.lastUpdateTime, Math.max(savedStartAt, savedSequenceAt));
            res.json(data);
        });

        /*
        io.sockets.on('connection', function(socket) {
            _sockets.push(socket);
            totalConnections++;
            socket.send(JSON.stringify({
                type: 'newStart',
                data: {
                    newStart: savedStart
                }
            }));
            socket.send(JSON.stringify({
                type: 'newSequence',
                data: {
                    newSequence: savedSequence
                }
            }));

            socket.on('disconnect', function() {
                totalDisconnections++;
                _sockets = _sockets.filter(function(_socket) {
                    return (socket !== _socket);
                });
            });
        });
        */

        this.updateStart = function(newStart) {
            savedStart = newStart;
            savedStartAt = Date.now();
            /*_sockets.forEach(function(socket) {
                socket.send(JSON.stringify({
                    type: 'newStart',
                    data: {
                        newStart: newStart
                    }
                }));
            });*/
        };

        this.updateSequence = function(newSequence) {
            savedSequence = newSequence;
            savedSequenceAt = Date.now();
            /*_sockets.forEach(function(socket) {
                socket.send(JSON.stringify({
                    type: 'newSequence',
                    data: {
                        newSequence: newSequence
                    }
                }));
            });*/
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