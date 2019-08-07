

var net = require("./net");
var gameManager = require("../gameManager");
var user = require("./../user");

module.exports = {

    S2CQuitRoom(data, cb){
        cb(data);
    },

    S2CUpdatePlayerInfo(data, cb){
        let { code,roomID,player } = data;
        // roomID = ("000000"+roomID).slice(-6);
        if (code == 0){
            // user.setProp({roomID});
            let gameInfo = gameManager.getGameInfo();
            let userInfo = user.getProp(["uid"]);
            let indexoff = player[userInfo["uid"]]["index"]-1;
            for (let uid in player){
                let pdate = player[uid];
                gameManager.setPlayerInfo(uid, pdate);
                let pos = player[uid]["index"] - indexoff;
                if (pos <= 0){
                    pos += 4;
                }
                gameInfo.uid2pos[uid] = pos;  // 更新玩家逻辑位置
            }
        }
        cc.log(gameManager.getAllPlayerInfo());
        cb(data);
    },


    /** 退出房间 */
    C2SQuitRoom(data, cb){
        let sub = [4,1];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SQuitRoom",sub,data);
    },
    /** 更新玩家信息 */
    C2SUpdatePlayerInfo(data, cb){
        let sub = [4,2];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SQuitRoom",sub,data);
    },

}