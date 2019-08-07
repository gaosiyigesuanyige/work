

var net = require("./net");
var gameManager = require("../gameManager");

module.exports = {
    /**
     * 游戏开始
     * 玩家手牌，起始回合人uid，操作结束时间戳
     */
    S2CGameBegin(data, cb){
        let { code,card,roundtime,op,roundstate } = data;
        if (code == 0){
            for (let uid in card){
                gameManager.setPlayerInfo(uid, {card:card[uid]});
            }
            let gameInfo = gameManager.getGameInfo();
            gameInfo.round = {roundtime,op,roundstate};
        }
        cb(data);
    },

    S2CGameEnd(data, cb){
        cb(data);
    },
    S2CGameDeal(data, cb){
        cb(data);
    },
    S2CGameCardInfo(data, cb){
        let { code,card } = data;
        if (code == 0){
            for (let uid in card){
                gameManager.setPlayerInfo(uid, {card:card[uid]});
            }
        }
        cb(data);
    },
    S2CGameRoundInfo(data, cb){
        let { code,roundtime,op,roundstate } = data;
        if (code == 0){
            let gameInfo = gameManager.getGameInfo();
            gameInfo.round = {roundtime,op,roundstate};
        }
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
    /** 1~5:出碰杠胡过 */
    C2SGameDeal(data, cb){
        let sub = [5,3];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SGameDeal",sub,data);
    },
    /** 更新游戏牌信息 */
    C2SGameCardInfo(data, cb){
        let sub = [5,4];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SGameCardInfo",sub,data);
    },
    /** 更新游戏阶段信息 */
    C2SGameRoundInfo(data, cb){
        let sub = [5,5];
        net.getInstance().send(sub, data, cb);
        cc.log("C2SGameRoundInfo",sub,data);
    },

}