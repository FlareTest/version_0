var express = require('express');
    app = express(),
    server = require('http').createServer(app),
    bodyParser = require('body-parser');

var favicon = require('serve-favicon');
var fs = require('fs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var tempData = {};

var converters = require('./services/converters');
var clientWorker = require('./services/clientWorker').createClientWorker(app);

app.get('/admin', function(req, res) {
    res.sendFile(__dirname + '/public/admin.html');
});

app.get('/currentTime', function(req, res) {
    var time = Date.now();
    res.json({"time": time});
});

app.get('/availableColors', function(req, res) {
    fs.readFile(__dirname + '/data/availableColors.json', function(err, data) {
       if (err) {
           console.log('error while reading "availableColors.json": ' + err);
       }
        res.send(data);
    });
});

app.post('/newMoments', function(req, res) {
    fs.writeFile(__dirname + '/data/storedMoments_'+req.body.userID+'.json', JSON.stringify(req.body.data), function(err) {
        res.sendStatus(200);
    });
});

app.get('/storedMoments', function(req, res) {
    fs.readFile(__dirname + '/data/storedMoments_' + req.query.userID + '.json', function(err, data) {
        if (err) {
            fs.readFile(__dirname + '/data/storedMoments.json', function(err, data) {
                if (err) {
                    console.log(err);
                }
                res.send(JSON.parse(data));
            });
        } else {
            res.send(JSON.parse(data));
        }
    });
});

app.get('/startTime', function(req, res) {
    if (clientWorker.startTimeAssigned()) {
        res.send({
            startTime: clientWorker.getStartTime()
        });
    } else {
        res.sendStatus(404);
    }
});

app.post('/newStart', function(req, res) {
    var userID = req.body.userID;
    var plannedStart = req.body.data.newStart;
    fs.readFile(__dirname + '/data/storedMoments_' + userID + '.json', function(err, data) {
        if (err) {
            // can't find data by ID, use pattern
            fs.readFile(__dirname + '/data/storedMoments.json', function(err, data) {
                clientWorker.updateStart(plannedStart);
                clientWorker.updateSequence(converters.ConvertMomentsToSequence(JSON.parse(data).moments));
            });
        } else {
            clientWorker.updateStart(plannedStart);
            clientWorker.updateSequence(converters.ConvertMomentsToSequence(JSON.parse(data).moments));
        }
        res.sendStatus(200);
    });
});


server.listen(20029);