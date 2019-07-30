

var net = require("./net");

module.exports = {

    S2CCreateRoom(data, cb){
        cc.log("S2CCreateRoom",data);
        cb(data);
    },
    S2CJoinRoom(data, cb){
        cc.log("S2CJoinRoom",data);
        cb(data);
    },


    /** 创建房间 */
    C2SCreateRoom(data, cb){
        let sub = [2,2];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SCreateRoom",sub,data);
    },
    /** 加入房间 */
    C2SJoinRoom(data, cb){
        let sub = [2,3];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SJoinRoom",sub,data);
    },

}