

var net = require("./net");

module.exports = {

    S2CLogin(data, cb){
        cb(data);
    },

    
    /** 登录 */
    C2SLogin(data, cb){
        let sub = [1];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SLogin",sub,data);
    },

}