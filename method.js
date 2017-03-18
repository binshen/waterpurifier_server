var moment = require('moment');
var config = require('./config');

module.exports.toDec = function(hex) {
    if(typeof hex === 'number') {
        return parseInt(hex);
    }
    return Number('0x' + hex);
};

module.exports.padLeft = function (str,length) {
    if(str.toString().length >= length) {
        return str.toString();
    } else {
        return this.padLeft("0"  + str.toString(), length);
    }
};

// module.exports.toDecStr = function(hex) {
//     return this.toDec(hex).toString();
// };
//
// module.exports.toDateStr = function(hex) {
//     var digit = this.toDec(hex);
//     if(digit < 10) {
//         return '0' + digit.toString();
//     }
//     return digit.toString();
// };

module.exports.getMac = function(data) {
    if(typeof data == 'string') {
        data = data.match(/.{2}/g);
    }
    var mac = data[6] + data[7] + data[8] + data[9] + data[10] + data[11]; //Mac
    return mac.toLowerCase();
};

module.exports.isEmpty = function(obj) {
    return obj == undefined || obj == null;
};