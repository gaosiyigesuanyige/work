
/**
 * 游戏中的玩家对象，记录玩家的基础信息
 * 用户自己也会存在玩家对象
 */

class GamePlayer{
    /**
     * data = {
     *      uid:Number,
     *      hand:Array, // 手牌
     *      deal:Array, // 已处理牌
     *      out:Array,  // 已出牌
     *      touch:Number,  // 摸牌
     * }
     */
    constructor(uid){
        this.uid = uid;
        this.data = {uid};
    }

    /** 获取属性 */
    getProp(){
        return this.data;
    }
    /** 设置属性，传入字典，更新user */
    setProp(data){
        for (let key in data){
            this.data[key] = data[key];
        }
    }
}

var GameManager = {
    player:{},
    game:{
        /** 回合信息 */
        round:{
            /** 操作结束时间戳 */
            roundtime:0,
            /** 当前操作人id */
            op:0,
            /** 回合状态：1-已摸牌 2-已出牌 3-已碰牌 */
            roundstate:1,
        },
        /** 记录每个玩家的逻辑位置 */
        uid2pos:{},
        nowCard:0,
    },
    version:0,  // 管理器记录数据版本
    /** 获取单个玩家信息 */
    getPlayer(uid){
        if (!GameManager.player[uid]){
            GameManager.player[uid] = new GamePlayer(uid);
        }
        return GameManager.player[uid].getProp();
    },
    /** 设置单个玩家信息 */
    setPlayer(uid, data){
        cc.log('setPlayer',uid)
        if (!GameManager.player[uid]){
            GameManager.player[uid] = new GamePlayer(uid);
        }
        GameManager.player[uid].setProp(data);
        GameManager.version++;    // 数据版本更新
    },
    /** 删除玩家数据 */
    delPlayer(uid){
        cc.log('delPlayer',uid)
        if (GameManager.player[uid]){
            delete GameManager.player[uid];
        }
    },
    /** 获取所有玩家信息，返回字典 */
    getAllPlayer(){
        let infos = {};
        for (let uid in GameManager.player){
            infos[uid] = GameManager.player[uid].getProp();
        }
        return infos;
    },
    /** 获取当前数据版本 */
    getVersion(){
        return GameManager.version;
    },
    /** 获取游戏信息 */
    getGameInfo(){
        return GameManager.game;
    },
    /** 清理 */
    doClear(){
        GameManager.player = {}
        GameManager.game = {
            round:{
                roundtime:0,
                op:0,
            },
            uid2pos:{},
        }
    },
}

module.exports = {
    getPlayerInfo:GameManager.getPlayer,
    setPlayerInfo:GameManager.setPlayer,
    delPlayerInfo:GameManager.delPlayer,
    getAllPlayerInfo:GameManager.getAllPlayer,
    getVersion:GameManager.getVersion,
    getGameInfo:GameManager.getGameInfo,
    doClear:GameManager.doClear,
};