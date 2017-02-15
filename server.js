/**
 * Created by bin.shen on 05/12/2016.
 */

var net = require('net');
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var config = require('./config');

function handleData(db, socket, value) {
    if(value.startsWith('5a01')) {
        socket.write(new Buffer([0x6a, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01, 0xa2]));

        setInterval(function() {
            socket.write(new Buffer([0x6a, 0x01, 0xff, 0xff, 0xff, 0xff, 0x01, 0xa2]));
            console.log("++++++++++")
        }, 6000);
    }
}

function doWork(db, socket, data) {
    if(data == "") return;

    handleData(db, socket, data.slice(0, 12));

    doWork(db, socket, data.slice(12));
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