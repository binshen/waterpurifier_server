/**
 * Created by bin.shen on 05/12/2016.
 */

var net = require('net');
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var method = require('./method');

var map = {
    "5a": 96,
    '6b': 96
};

global.dev_sockets = {};
global.app_sockets = {};

function handleData(db, socket, value, mac) {
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
    if(value.startsWith('5a')) {

        return;
    }

    if(value.startsWith('6b')) {
        if(dev_sockets[mac] != null && dev_sockets[mac].writable) {
            var result = [];
            var command = value.slice(14);
            command.match(/.{2}/g).forEach(function(d){
                result.push(method.toDec(d));
            });
            dev_sockets[mac].write(new Buffer(result));
        }
        return;
    }
}

function doWork(db, socket, data) {
    if(data == "") return;

    var prefix = value.slice(0, 2);
    var length = map[prefix];
    if(length > 0) {
        var value = data.slice(0, length);
        if(value.length < length) return;

        var mac = value.slice(2, 14).toLowerCase();
        if(prefix == "5a") {
            dev_sockets[mac] = socket;
        } else if(prefix == "6b") {
            if(app_sockets[mac] == undefined || app_sockets[mac] == null) {
                app_sockets[mac] = [];
            }
            app_sockets[mac].push(socket);
        }

        handleData(db, socket, value, mac);

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
            for (var mac in dev_sockets) {
                if(dev_sockets[mac] == socket) {
                    dev_sockets[mac] = undefined;
                    break;
                }
                var _sockets = app_sockets[mac];
                if(Object.prototype.toString.call(_sockets) === '[object Array]' && _sockets.length > 0) {
                    for(var i = 0; i < _sockets.length; i++) {
                        if(_sockets[i] == socket) {
                            _sockets.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        });
    }).listen(config.PORT, config.HOST);

    console.log('TCP Server listening on ' + config.HOST + ':' + config.PORT);
});