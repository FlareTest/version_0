module.exports = {
    createClientWorker: function(io) {
        var savedStart = Date.now() - 0 + 100000000000;
        var savedSequence = [];
        var _sockets = [];
        var totalConnections = 0;
        var totalDisconnections = 0;
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

        this.updateStart = function(newStart) {
            savedStart = newStart;
            _sockets.forEach(function(socket) {
                socket.send(JSON.stringify({
                    type: 'newStart',
                    data: {
                        newStart: newStart
                    }
                }));
            });
        };

        this.updateSequence = function(newSequence) {
            savedSequence = newSequence;
            _sockets.forEach(function(socket) {
                socket.send(JSON.stringify({
                    type: 'newSequence',
                    data: {
                        newSequence: newSequence
                    }
                }));
            });
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