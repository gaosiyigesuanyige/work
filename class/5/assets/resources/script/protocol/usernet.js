

var net = require("./net");

module.exports = {

    S2CInitUserInfo(data, cb){
        cb(data);
    },

    
    /** 初始化玩家数据 */
    C2SInitUserInfo(data, cb){
        let sub = [2,1];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SInitUserInfo",sub,data);
    },

}