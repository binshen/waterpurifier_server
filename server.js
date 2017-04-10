/**
 * Created by bin.shen on 05/12/2016.
 */

var net = require('net');
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var method = require('./method');
var empty = require('is-empty');

var map = {
    "5a": 96,
    '6b': 96
};

global.dev_sockets = {};
global.app_sockets = {};

function handleDevData(db, socket, value, mac, ctrl) {

    var fields = value.match(/.{2}/g);

    //心跳包
    if(ctrl == '00') {
        //剩余流量
        var x9 =  method.toDec(fields[16]) * 256 + method.toDec(fields[17]);
        //已用流量
        var x11 = method.toDec(fields[20]) * 256 + method.toDec(fields[21]);
        //净水TDS值
        var x13 = method.toDec(fields[24]) * 256 + method.toDec(fields[25]);
        //原水TDS值
        var x14 = method.toDec(fields[26]) * 256 + method.toDec(fields[27]);
        //第一滤芯寿命-剩余流量
        var x15 = method.toDec(fields[28]) * 256 + method.toDec(fields[29]);
        //第二滤芯寿命-剩余流量
        var x16 = method.toDec(fields[30]) * 256 + method.toDec(fields[31]);
        //第三滤芯寿命-剩余流量
        var x17 = method.toDec(fields[32]) * 256 + method.toDec(fields[33]);
        //第四滤芯寿命-剩余流量
        var x18 = method.toDec(fields[34]) * 256 + method.toDec(fields[35]);
        //第五滤芯寿命-剩余流量
        var x19 = method.toDec(fields[36]) * 256 + method.toDec(fields[37]);
        //第一滤芯寿命-最大流量
        var x20 = method.toDec(fields[38]) * 256 + method.toDec(fields[39]);
        //第二滤芯寿命-最大流量
        var x21 = method.toDec(fields[40]) * 256 + method.toDec(fields[41]);
        //第三滤芯寿命-最大流量
        var x22 = method.toDec(fields[42]) * 256 + method.toDec(fields[43]);
        //第四滤芯寿命-最大流量
        var x23 = method.toDec(fields[44]) * 256 + method.toDec(fields[45]);
        //第五滤芯寿命-最大流量
        var x24 = method.toDec(fields[46]) * 256 + method.toDec(fields[47]);
        return;
    }

    //用水同步
    if(ctrl == '06') {
        //本次水量
        var x6 =  method.toDec(fields[10]) * 256 + method.toDec(fields[11]);
        //剩余流量
        var x9 =  method.toDec(fields[16]) * 256 + method.toDec(fields[17]);
        //已用流量
        var x11 = method.toDec(fields[20]) * 256 + method.toDec(fields[21]);
        //净水TDS值
        var x13 = method.toDec(fields[24]) * 256 + method.toDec(fields[25]);
        //原水TDS值
        var x14 = method.toDec(fields[26]) * 256 + method.toDec(fields[27]);
        return;
    }

    //设备状态变更
    if(ctrl == '0C') {
        //状态
        var x4 = method.toDec(fields[9]);
        return;
    }
}

function handleAppData(db, socket, value, mac, ctrl) {
/*
    var command = mac + '01' + ctrl + '000000000000000000000000000000000000000000000000000000000000000000000000000000';

    if(ctrl == '01') { //关机指令

    } else if(ctrl == '02') { //开机指令

    } else if(ctrl == '03') { //强冲指令

    } else if(ctrl == '05') { //充值指令

    } else if(ctrl == '07') { //滤芯复位

    } else if(ctrl == '08') { //模式切换

    } else if(ctrl == '09') { //系统初始化

    } else if(ctrl == '0A') { //恢复出厂设置

    } else if(ctrl == '0B') { //用时同步

    } else if(ctrl == '0D') { //查询设备信息

    } else if(ctrl == '0E') { //获取移动信号和ICCID

    }

    if(command.length != 94) return;

    var result = [];
    command.match(/.{2}/g).forEach(function(d){
        result.push(method.toDec(d));
    });
    dev_sockets[mac].write(new Buffer(result));
*/

    var command = config.COMMAND;
    command[1] = method.toDec(mac.slice(0,2));
    command[2] = method.toDec(mac.slice(2,4));
    command[3] = method.toDec(mac.slice(4,6));
    command[4] = method.toDec(mac.slice(6,7));
    command[5] = method.toDec(mac.slice(8,10));
    command[6] = method.toDec(mac.slice(10,12));
    command[7] = 0x01;
    command[8] = method.toDec(ctrl);

    //充值指令
    if(ctrl == '05') {

    }

    dev_sockets[mac].write(new Buffer(command));
}


function handleData(db, socket, value, mac) {

    //终端->平台
    if(value.startsWith('5a')) {
        var ctrl = value.slice(14, 16).toUpperCase();
        handleDevData(db, socket, value, mac, ctrl);
        return;
    }

    //手机->平台
    if(value.startsWith('6b')) {
        if(!empty(dev_sockets[mac]) && dev_sockets[mac].writable) {
            var ctrl = value.slice(16, 18).toUpperCase();
            handleAppData(db, socket, value, mac, ctrl);
        }
        return;
    }
}

function doWork(db, socket, data) {
    if(empty(data)) return;

    var prefix = data.slice(0, 2);
    var length = map[prefix];
    if(length > 0) {
        var value = data.slice(0, length);
        if(value.length < length) return;

        var mac = value.slice(2, 14).toLowerCase();

        if(prefix == "5a") { //终端数据包
            dev_sockets[mac] = socket;
        } else if(prefix == "6b") { //app数据包
            if(empty(app_sockets[mac])) {
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
                var break_flag = false;
                if(dev_sockets[mac] == socket) {
                    dev_sockets[mac] = undefined;
                    break_flag = true;
                }
                var _sockets = app_sockets[mac];
                if(Object.prototype.toString.call(_sockets) === '[object Array]' && _sockets.length > 0) {
                    for(var i = 0; i < _sockets.length; i++) {
                        if(_sockets[i] == socket || !_sockets[i].writable) {
                            app_sockets[mac].splice(i, 1);
                            if(app_sockets[mac].length < 1) {
                                app_sockets[mac] = undefined;
                                break_flag = true;
                            }
                        }
                    }
                }
                if(break_flag) {
                    break;
                }
            }
        });
    }).listen(config.PORT, config.HOST);

    console.log('TCP Server listening on ' + config.HOST + ':' + config.PORT);
});