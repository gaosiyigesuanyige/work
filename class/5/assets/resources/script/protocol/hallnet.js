

var net = require("./net");
var user = require("./../user");

module.exports = {

    S2CCreateRoom(data, cb){
        let { code,roomID } = data;
        roomID = ("000000"+roomID).slice(-6);
        if (code == 0){
            user.setProp({roomID});
        }
        cb(data);
    },
    S2CJoinRoom(data, cb){
        let { code,roomID } = data;
        roomID = ("000000"+roomID).slice(-6);
        if (code == 0){
            user.setProp({roomID});
        }
        cb(data);
    },


    /** 创建房间 */
    C2SCreateRoom(data, cb){
        let sub = [3,1];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SCreateRoom",sub,data);
    },
    /** 加入房间 */
    C2SJoinRoom(data, cb){
        let sub = [3,2];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SJoinRoom",sub,data);
    },

}