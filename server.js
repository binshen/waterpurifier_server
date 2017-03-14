/**
 * Created by bin.shen on 05/12/2016.
 */

var net = require('net');
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var config = require('./config');

var map = {
    "5a0000": 100,
    '6b0000': 50
};

global.sockets = {};
global.app_sockets = {};

function handleData(db, socket, value) {
/*
    if(value.startsWith('5a01')) {
        socket.write(new Buffer([0x6a, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01, 0xa2]));

        setInterval(function() {
            if(socket.writable) {
                socket.write(new Buffer([0x6a, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01, 0xa2]));
                console.log("++++++++++")
            }
        }, 6000);
    }
*/
    var mac = value.slice(6,18).toLowerCase();
    if(value.startsWith('5a0000')) {

        return;
    }

    if(value.startsWith('6b0000')) {

        return;
    }
}

function doWork(db, socket, data) {
    if(data == "") return;
    var length = map[data.slice(0, 6)];
    if(length > 0) {
        var value = data.slice(0, length);
        if(value.length >= 18) {
            var mac = value.slice(6,18).toLowerCase();
            if(value.slice(0,6) == "6b0000") {
                if(app_sockets[mac] == undefined || app_sockets[mac] == null) {
                    app_sockets[mac] = [];
                }
                app_sockets[mac].push(socket);
            } else {
                sockets[mac] = socket;
            }
        }

        handleData(db, socket, value);

        doWork(db, socket, data.slice(length));
    }
}

mongoClient.connect(config.URL, function(err, db) {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log('Connecting to Mongo DB at ' + config.URL);

    net.createServer().on('connection', function(socket){
        console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);

        socket.on('data', function(data) {
            if(data == null) {
                console.log("Error - invalid data - null or undefined");
                return;
            }

            var value = data.toString('hex').toLowerCase();
            console.log(moment().format('YYYY-MM-DD HH:mm:ss') + " => " + value);

            doWork(db, socket, value);
        });

        socket.on('end', function(){

        });

        socket.on('error', function(error) {
            console.log(error);
            socket.end();
        });

        socket.on('timeout',function(){
            socket.end();
        });

        socket.on('close', function(data) {
            console.log('Closed socket: ' + socket.remoteAddress +' '+ socket.remotePort);
        });

        socket.on('close', function(data) {
            console.log('Closed socket: ' + socket.remoteAddress + ' ' + socket.remotePort);
        });
    }).listen(config.PORT, config.HOST);

    console.log('TCP Server listening on ' + config.HOST + ':' + config.PORT);
});