

var net = require("./net");
var gameManager = require("../gameManager");

module.exports = {
    /**
     * 游戏开始
     * 玩家手牌，起始回合人uid，操作结束时间戳
     */
    S2CGameBegin(data, cb){
        cc.log("S2CGameBegin",data);
        let { code,card,roundtime,op } = data;
        if (code == 0){
            for (let uid in card){
                gameManager.setPlayerInfo(uid, {card:card[uid]});
            }
            let gameInfo = gameManager.getGameInfo();
            gameInfo.round = {roundtime,op};
        }
        cb(data);
    },

    S2CGameEnd(data, cb){
        cc.log("S2CGameEnd",data);
        cb(data);
    },


    /** 游戏开始 */
    C2SGameBegin(data, cb){
        let sub = [5,1];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SGameBegin",sub,data);
    },
    /** 游戏结束 */
    C2SGameEnd(data, cb){
        let sub = [5,2];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SGameEnd",sub,data);
    },

}