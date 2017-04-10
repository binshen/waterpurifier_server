/**
 * Created by bin.shen on 05/12/2016.
 */

var config = {

    HOST: "127.0.0.1",
    PORT: 9999,
    URL: "mongodb://user:pass@127.0.0.1:27017/my_db",

    COMMAND: [
        0x5A, //包头
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //MAC地址
        0x00, //计费模式 0=按时长；1=按流量
        0x00, //cTrl指令
        0x00, //设备状态 [0：出厂测试状态，1：正常状态（水满），2：欠费状态，3：故障状态，4：关机状态，5：漏水状态，6：待激活状态，7：流量异常，8：频发数据(5分钟内发送超过20次), 9：制水状态, 10：冲洗状态, 11：缺水状态]
        0x00, 0x00, //本次用量 单位：10ml，只在发生用水行为后上传时有数据，其它时间传0
        0x00, 0x00, //充值流量 单位：L，只在充值时有数据，其他时间传0
        0x00, 0x00, //充值天数 单位：天，只在充值时有数据，其他时间传0
        0x00, 0x00, //剩余流量 单位：L
        0x00, 0x00, //剩余天数 单位：天，以平台端为主，每24小时传平台端实际数据
        0x00, 0x00, //已用流量 单位：L
        0x00, 0x00, //已用天数 单位：天，以平台端为主，每次都传平台端实际数据
        0x00, 0x00, //净水TDS值
        0x00, 0x00, //原水TDS值
        0x00, 0x00, //第一滤芯寿命-剩余流量 单位：Ｌ，复位滤芯时有数据，其他时间传0
        0x00, 0x00, //第二滤芯寿命-剩余流量 单位：Ｌ，复位滤芯时有数据，其他时间传0
        0x00, 0x00, //第三滤芯寿命-剩余流量 单位：Ｌ，复位滤芯时有数据，其他时间传0
        0x00, 0x00, //第四滤芯寿命-剩余流量 单位：Ｌ，复位滤芯时有数据，其他时间传0
        0x00, 0x00, //第五滤芯寿命-剩余流量 单位：Ｌ，复位滤芯时有数据，其他时间传0 (当命令为0E时，第35字节为获取移动信号强度值)
        0x00, 0x00, //第一滤芯寿命-最大流量 单位：Ｌ（当命令为0E时为ICCID，16进制）
        0x00, 0x00, //第二滤芯寿命-最大流量 单位：Ｌ（当命令为0E时为ICCID，16进制）
        0x00, 0x00, //第三滤芯寿命-最大流量 单位：Ｌ（当命令为0E时为ICCID，16进制）
        0x00, 0x00, //第四滤芯寿命-最大流量 单位：Ｌ（当命令为0E时为ICCID，16进制）
        0x00, 0x00  //第五滤芯寿命-最大流量 单位：Ｌ（当命令为0E时为ICCID，16进制）
    ]
};

module.exports = config;