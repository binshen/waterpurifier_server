/**
 * Created by bin.shen on 2017/2/13.
 */

var net = require('net');

var HOST = '120.55.161.114';
var PORT = 9999;

var client = new net.Socket();

client.connect(PORT, HOST, function() {
    console.log('Connected');
    client.write(new Buffer([ 0x5a, 0x01, 0x10, 0x01, 0x00, 0x04, 0xac, 0xcf, 0x23, 0xb8, 0x7f, 0xa2 ]));
});

client.on('data', function(data) {
    console.log('Received: ' + data.toString('hex'));
    client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});