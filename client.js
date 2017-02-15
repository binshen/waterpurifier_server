/**
 * Created by bin.shen on 2017/2/13.
 */

var net = require('net');

var HOST = '120.55.161.114';
var PORT = 9999;

var client = new net.Socket();

client.connect(PORT, HOST, function() {
    console.log('Connected');

    var data = [];
    var command = "5a0110010004accf23b87fa2";
    command.match(/.{2}/g).forEach(function(d){
        data.push(Number('0x' + d));
    });
    client.write(new Buffer(data));
    console.log('Sent: ' + command);
});

client.on('data', function(data) {
    console.log('Received: ' + data.toString('hex'));
    client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});