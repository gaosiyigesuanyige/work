
var roomnet = require("./protocol/roomnet");
var gamenet = require("./protocol/gamenet")
var gameManager = require("./gameManager");
var gameLogic = require("./gameLogic");
var user = require("./user");

/** 枚举对应预制名字前缀 */
var PREFAB = {
    /** 处理掉的牌，杠碰牌 */
    DEAL:"dealcard",
    /** 手牌 */
    HAND:"handcard",
    /** 已出的牌 */
    OUT:"outcard",
};

cc.Class({
    extends: cc.Component,

    properties: {
        mainNode:cc.Node,
        cardImages:cc.SpriteAtlas,
        cardPrefabList:{
            default:[],
            type:cc.Prefab,
        }
    },

    /** 界面初始化操作 */
    init() {
        let { roomID } = user.getProp(["roomID"]);
        let roomIDNode = this.mainNode.getChildByName("roomID");
        roomIDNode.getComponent(cc.Label).string = "房间ID：" + roomID;
        this.hidePanelDeal();
    },

    /** 初始化玩家信息设置 */
    initForPlayerInfo() {
        let doFunc = (nodeName)=>{  // 隐藏更多信息，显示简短头像状态
            let theNode = this.mainNode.getChildByName(nodeName);
            let bgmoreNode = theNode.getChildByName("bgmore");
            bgmoreNode.active = false;
            // bgmoreNode.getChildByName("name").getComponent(cc.Label).string = "";
            // bgmoreNode.getChildByName("gold").getComponent(cc.Label).string = "";
        }
        doFunc("player_info1");
        doFunc("player_info2");
        doFunc("player_info3");
        doFunc("player_info4");
    },

    /** 操作界面内容隐藏 */
    hidePanelDeal() {
        let panelDeal = this.mainNode.getChildByName("paneldeal");
        let pengNode = panelDeal.getChildByName("peng");
        let gangNode = panelDeal.getChildByName("gang");
        let huNode = panelDeal.getChildByName("hu");
        let guoNode = panelDeal.getChildByName("guo");
        pengNode.active = false;
        gangNode.active = false;
        huNode.active = false;
        guoNode.active = false;
    },

    /** 点击按钮，根据customEventData来区分 */
    onClickButton(event, customEventData) {
        switch (customEventData){
            case "test":{
                let targetNode = event.target;
                let subNode = targetNode.getChildByName("bgmore");
                subNode.active = !subNode.active;
                // this.delHandCard(1, 121);   // test，测试删除手牌
                // this.addNewCard(121);
                // this.delDealCard(1, 11);   // test，测试删除杠碰牌
                // this.delOutCard(1, 111);   // test，测试删除已出牌
                break;
            }
            case "退出":{
                this.mainNode.getChildByName("msgbox").active = true;
                break;
            }
            case "确认":{
                this.doQuit();
                break;
            }
            case "取消":{
                this.mainNode.getChildByName("msgbox").active = false;
                break;
            }
            case "点击手牌":{
                this.doClickHandCard(event, 1);
                break;
            }
            case "点击摸牌":{
                this.doClickHandCard(event, 2);
                break;
            }
            case "碰":{
                this.doClickDeal(1);
                break;
            }
            case "杠":{
                this.doClickDeal(2);
                break;
            }
            case "胡":{
                this.doClickDeal(3);
                break;
            }
            case "过":{
                this.doClickDeal(4);
                break;
            }
            default:{
                cc.log("未设置对按钮事件的处理", customEventData);
            }
        }
    },

    /** 通过当前已出牌找到手牌、刚配牌里面所有相同值的牌 */
    findSameCardForNowOut() {
        let { uid } = user.getProp(["uid"]);
        let userPlayerInfo = gameManager.getPlayerInfo(uid);
        let { hand,deal } = userPlayerInfo["card"];
        let gameInfo = gameManager.getGameInfo();
        let playerInfo = gameManager.getPlayerInfo(gameInfo.round.op);
        let { out } = playerInfo["card"];
        let card = {hand:[],deal:[]};
        if (!out || out.length == 0){
            return card;
        }
        let val = out[out.length-1] % 100;
        for (let cardID of hand){
            if (cardID % 100 ==val){
                card["hand"].push(cardID);
            }
        }
        for (let cardID of deal){
            if (cardID % 100 ==val){
                card["deal"].push(cardID);
            }
        }
        return card;
    },

    /** 点击杠碰胡过（2/3/4/5）处理按钮 */
    doClickDeal(op) {
        let Play = (path)=>{
            if (!this.mainNode.getChildByName("deal")){
                cc.loader.loadRes("prefab/dealclip", cc.Prefab, (err, prefab)=>{
                    if (err){
                        cc.log("杠碰预制加载失败");
                        return;
                    }
                    let newDealNode = cc.instantiate(prefab);
                    let clip = newDealNode.getComponent(cc.Animation);
                    this.mainNode.addChild(newDealNode);
                    clip.once("finished", ()=>{
                        newDealNode.removeFromParent(true);
                    })
                    cc.loader.loadRes(path, cc.SpriteFrame, (err2, spriteFrame)=>{
                        if (err2){
                            cc.log("杠碰资源加载失败");
                            return;
                        }
                        newDealNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        clip.play()
                    });
                });
            }
        };
        let resPath = "";
        switch (op){
            case 1:{
                let card = gameLogic.isPeng();
                // let card = this.findSameCardForNowOut();
                let req = { op:2,card };
                gamenet.C2SGameDeal(req, ()=>{
                    cc.log("执行碰牌");
                });
                resPath = "image/icon/splash_1";
                break;
            }
            case 2:{
                let card = gameLogic.isGang();
                // let card = this.findSameCardForNowOut();
                let req = { op:3,card };
                gamenet.C2SGameDeal(req, ()=>{
                    cc.log("执行杠牌");
                });
                resPath = "image/icon/splash_2";
                break;
            }
            case 3:{
                // let card = this.findSameCardForNowOut();
                let req = { op:4,card:[] };
                gamenet.C2SGameDeal(req, ()=>{
                    cc.log("执行胡牌");
                });
                resPath = "image/icon/splash_3";
                break;
            }
            case 4:{
                let req = { op:5,card:[] };
                gamenet.C2SGameDeal(req, ()=>{
                    cc.log("执行过牌");
                });
                break;
            }
            default:{
                cc.log("没有对应的处理操作", op);
                break;
            }
        }
        this.hidePanelDeal();
        if (resPath){
            Play(resPath);
        }
    },

    /** 出牌操作 */
    doOutCard(cid) {
        let req = { op:1,card:[cid] };
        gamenet.C2SGameDeal(req, ()=>{
            cc.log("执行出牌");
        });
    },
    
    /** 点击手牌，type：1-手牌 2-摸牌 */
    doClickHandCard(event, type) {
        let handNode = this.mainNode.getChildByName("handcard1");
        let newCardNode = this.mainNode.getChildByName("newcard");
        if (type == 1){
            // 初始化摸牌位置
            if (newCardNode.childrenCount > 0){
                let c = newCardNode.children[0];
                if (c.active && c.initY != undefined){
                    c.stopAllActions();
                    c.y = c.initY;
                    c.initY = undefined;
                }
            }
            // 计算点击位置基于手牌区域最左边的偏移量
            let off = handNode.width/2+handNode.convertToNodeSpaceAR(event.getLocation()).x;
            let idx = Math.floor(off/83);   // 83为每个手牌的宽度，偏移量/手牌宽度=点击到的第idx个手牌
            // 处理手牌的一次点击、二次点击
            for (let i=0; i<handNode.childrenCount; i++){
                let c = handNode.children[i];
                if (idx == i){
                    if (c.initY == undefined){  // initY既代表是否选中，也记录初始y坐标
                        c.initY = c.y;
                        let selectAction = cc.moveTo(0.1, cc.v2(c.x, c.y+50));
                        c.runAction(selectAction);
                    }
                    else{
                        cc.log("第二次点击手牌",idx);
                        this.doOutCard(c.cid);
                    }
                }
                else{
                    if (c.initY != undefined){
                        c.stopAllActions();
                        c.y = c.initY;
                        c.initY = undefined;
                    }
                }
            }
        }
        else if (type == 2){    // 点击摸牌
            // 初始所有手牌位置
            for (let i=0; i<handNode.childrenCount; i++){
                let c = handNode.children[i];
                if (c.initY != undefined){
                    c.stopAllActions();
                    c.y = c.initY;
                    c.initY = undefined;
                }
            }
            // 处理摸牌的一次点击、二次点击
            if (newCardNode.childrenCount > 0){
                let c = newCardNode.children[0];
                if (!c.active){
                    return;
                }
                if (c.initY == undefined){
                    c.initY = c.y;
                    let selectAction = cc.moveTo(0.1, cc.v2(c.x, c.y+50));
                    c.runAction(selectAction);
                }
                else{
                    cc.log("第二次点击摸牌");
                    this.doOutCard(c.cid);
                }
            }
        }
    },

    /** 执行退出操作 */
    doQuit() {
        roomnet.C2SQuitRoom({}, (res)=>{
            let { code } = res;
            if (code == 0){
                cc.log("成功退出房间");
                gameManager.doClear();
                cc.director.loadScene("hall");
            }
        });
        // cc.director.loadScene("hall");   // 测试
    },

    /**
     * 根据信息获取图集中对应卡牌纹理
     * pos:玩家逻辑位置
     * cid:手牌id
     * op:操作类型，1-手牌 2-杠碰牌 3-已出牌
     * 资源解释：
     *      l-左家出牌、杠碰牌
     *      r-右家出牌杠碰牌
     *      h-本家和上家出牌、杠碰牌
     *      纯数字-本家手牌
     *      tbgs_1/tbgs_2/tbgs_3-右家/上家/左家/手牌
     */
    getCardSpriteFrame(pos, cid, op) {
        let cardval = cid % 100;
        let frameName = "";
        switch (pos){
            case 1:{    // 自己
                if (op == 1){
                    frameName = "" + cardval;
                }
                else if (op == 2){
                    frameName = "h" + cardval;
                }
                else if (op == 3){
                    frameName = "h" + cardval;
                }
                break;
            }
            case 2:{    // 左家
                if (op == 1){
                    frameName = "tbgs_3";
                }
                else if (op == 2){
                    frameName = "l" + cardval;
                }
                else if (op == 3){
                    frameName = "l" + cardval;
                }
                break;
            }
            case 3:{    // 上家
                if (op == 1){
                    frameName = "tbgs_2";
                }
                else if (op == 2){
                    frameName = "h" + cardval;
                }
                else if (op == 3){
                    frameName = "h" + cardval;
                }
                break;
            }
            case 4:{    // 右家
                if (op == 1){
                    frameName = "tbgs_1";
                }
                else if (op == 2){
                    frameName = "r" + cardval;
                }
                else if (op == 3){
                    frameName = "r" + cardval;
                }
                break;
            }
            default:{
                cc.log("未定义的玩家逻辑位置", pos);
                break;
            }
        }
        return this.cardImages.getSpriteFrame(frameName);
    },

    /** 添加新摸牌 */
    addNewCard(cid) {
        let newCardNode = this.mainNode.getChildByName("newcard");
        let spriteFrame = this.getCardSpriteFrame(1, cid, 1);
        if (newCardNode.childrenCount == 0){
            let newCard = new cc.Node();
            let newSp = newCard.addComponent(cc.Sprite);
            newCard.cid = cid;
            newSp.spriteFrame = spriteFrame;
            newCardNode.addChild(newCard);
        }
        newCardNode.active = true;
        newCardNode.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    },

    /** 删除新摸牌 */
    delNewCard() {
        this.mainNode.getChildByName("newcard").active = false;
    },

    /** 添加手牌 */
    addHandCard(pos, cid) {
        let doFunc = ()=>{
            let tNode = this.handCards[pos][cid];
            tNode.cid = cid;
            let sp = tNode.getChildByName("card").getComponent(cc.Sprite);
            sp.spriteFrame = this.getCardSpriteFrame(pos, cid, 1);  // 获取手牌纹理
            if (!tNode.parent){
                this.mainNode.getChildByName("handcard"+pos).addChild(tNode);
            }
        };
        if (!this.handCards[pos]){  // 第一次添加玩家手牌
            this.handCards[pos] = {};
        }
        if (!this.handCards[pos][cid]){ // 添加不存在的牌
            let path = "prefab/"+PREFAB.HAND+pos;
            cc.loader.loadRes(path, cc.Prefab, (err, prefab)=>{
                if (err){
                    cc.log("手牌预制加载失败",path);
                    return;
                }
                this.handCards[pos][cid] = cc.instantiate(prefab);
                doFunc();
            });
        }
        else{   // 重复添加已存在的牌，覆盖数据
            doFunc();
        }
    },

    /** 删除手牌 */
    delHandCard(pos, cid) {
        if (this.handCards[pos] && this.handCards[pos][cid]){
            this.handCards[pos][cid].removeFromParent();
            // delete this.handCards[pos][cid];
        }
    },

    /** 添加杠碰牌，full：0-碰 1-杠 */
    addDealCard(pos, cid, full) {
        let doSubFunc = (tNode, subName)=>{
            let subNode = tNode.getChildByName(subName);
            let sp = subNode.getComponent(cc.Sprite);
            sp.spriteFrame = this.getCardSpriteFrame(pos, cid, 2);  // 获取杠碰牌纹理
            return subNode;
        }
        let doFunc = ()=>{
            let tNode = this.dealCards[pos][cid];
            tNode.cid = cid;
            let sNode1 = doSubFunc(tNode, "card1");
            let sNode2 = doSubFunc(tNode, "card2");
            let sNode3 = doSubFunc(tNode, "card3");
            let sNode4 = doSubFunc(tNode, "card4");
            sNode4.active = full;   // 是否杠由第四个card决定
            if (!tNode.parent){
                this.mainNode.getChildByName("dealcard"+pos).addChild(tNode);
            }
        };
        if (!this.dealCards[pos]){  // 第一次添加玩家手牌
            this.dealCards[pos] = {};
        }
        if (!this.dealCards[pos][cid]){ // 添加不存在的牌
            let path = "prefab/"+PREFAB.DEAL+pos;
            cc.loader.loadRes(path, cc.Prefab, (err, prefab)=>{
                if (err){
                    cc.log("手牌预制加载失败",path);
                    return;
                }
                this.dealCards[pos][cid] = cc.instantiate(prefab);
                doFunc();
            });
        }
        else{   // 重复添加已存在的牌，覆盖数据
            doFunc();
        }
    },

    /** 删除杠碰牌 */
    delDealCard(pos, cid) {
        if (this.dealCards[pos] && this.dealCards[pos][cid]){
            this.dealCards[pos][cid].removeFromParent();
            // delete this.dealCards[pos][cid];
        }
    },

    /** 添加已出牌 */
    addOutCard(pos, cid) {
        let doFunc = ()=>{
            let tNode = this.outCards[pos][cid];
            tNode.cid = cid;
            let sp = tNode.getChildByName("card").getComponent(cc.Sprite);
            sp.spriteFrame = this.getCardSpriteFrame(pos, cid, 3);  // 获取手牌纹理
            if (!tNode.parent){
                this.mainNode.getChildByName("outcard"+pos).addChild(tNode);
            }
        };
        if (!this.outCards[pos]){  // 第一次添加玩家手牌
            this.outCards[pos] = {};
        }
        if (!this.outCards[pos][cid]){ // 添加不存在的牌
            let path = "prefab/"+PREFAB.OUT+pos;
            cc.loader.loadRes(path, cc.Prefab, (err, prefab)=>{
                if (err){
                    cc.log("手牌预制加载失败",path);
                    return;
                }
                this.outCards[pos][cid] = cc.instantiate(prefab);
                doFunc();
            });
        }
        else{   // 重复添加已存在的牌，覆盖数据
            doFunc();
        }
    },

    /** 删除杠碰牌 */
    delOutCard(pos, cid) {
        if (this.outCards[pos] && this.outCards[pos][cid]){
            this.outCards[pos][cid].removeFromParent();
            // delete this.outCards[pos][cid];
        }
    },

    /** 清理用户所有牌，用于刷新时的初始化操作 */
    clearAllCard(pos) {
        this.mainNode.getChildByName("handcard"+pos).removeAllChildren();
        this.mainNode.getChildByName("dealcard"+pos).removeAllChildren();
        this.mainNode.getChildByName("outcard"+pos).removeAllChildren();
        if (pos == 1){
            this.mainNode.getChildByName("newcard").removeAllChildren();
        }
    },

    /** 尝试加载更新玩家数据 */
    doLoadPlayerInfo() {
        if (this.infoVersion >= gameManager.getVersion()){
            return;
        }
        this.infoVersion = gameManager.getVersion();
        let userInfo = user.getProp(["uid"]);
        let infos = gameManager.getAllPlayerInfo();
        if (!infos[userInfo["uid"]]){    // 如果没有记录自己的信息则无法确定大家的席位
            cc.log("缺少用户本人的玩家信息");
            return;
        }
        let gameInfo = gameManager.getGameInfo();
        for (let uid in infos){ // 遍历所有玩家
            let { nickname,index,card } = infos[uid];
            let pos = gameInfo.uid2pos[uid];
            let theNode = this.mainNode.getChildByName("player_info"+pos);
            let bgmoreNode = theNode.getChildByName("bgmore");
            let nameNode = bgmoreNode.getChildByName("name");
            nameNode.getComponent(cc.Label).string = nickname;

            if (card){
                this.clearAllCard(pos); // 先清理掉手牌、杠碰牌、已出牌
                let { hand,deal,out,touch } = card;
                if (touch && uid == userInfo["uid"]){   // 处理摸牌
                    this.addNewCard(touch);
                }
                hand.sort((a,b)=>{return a%100 - b%100});   // 手牌排序
                for (let cid of hand){  // 手牌
                    if (touch != cid || uid != userInfo["uid"]){    // 摸牌，自己不放入手牌，他人放入手牌
                        this.addHandCard(pos, cid);
                    }
                }
                for (let dcid of deal){ // 处理牌
                    let cid = dcid % 1000;
                    let full = dcid > 1000;
                    this.addDealCard(pos, cid, full);
                }
                for (let cid of out){   // 出牌
                    this.addOutCard(pos, cid);
                }
            }
        }
    },

    /** 处理操作检测 */
    doCheckOperation() {
        let { round:{ roundstate,op } } = gameManager.getGameInfo();
        if (roundstate != 2){    // 非已出牌阶段跳过检测
            this.roundState = 0;
            return;
        }
        if (this.roundState == 2){  // 已出牌阶段只处理一次
            return;
        }
        this.roundState = 2;
        let panelDeal = this.mainNode.getChildByName("paneldeal");
        let pengNode = panelDeal.getChildByName("peng");
        let gangNode = panelDeal.getChildByName("gang");
        let huNode = panelDeal.getChildByName("hu");
        let guoNode = panelDeal.getChildByName("guo");
        pengNode.active = false;
        gangNode.active = false;
        huNode.active = false;
        guoNode.active = false;
        let { uid } = user.getProp(["uid"]);
        if (op == uid){ // 自己出牌执行跳过操作
            let req = { op:5,card:[] };
            gamenet.C2SGameDeal(req, ()=>{});
            return;
        }
        if (gameLogic.isHu()){  // 胡
            huNode.active = true;
        }
        if (gameLogic.isPeng()){    // 碰
            pengNode.active = true;
        }
        if (gameLogic.isGang()){    // 杠
            gangNode.active = true;
        }

        if (pengNode.active || gangNode.active || huNode.active){
            guoNode.active = true;
        }
        else{
            guoNode.active = false;
            let req = { op:5,card:[] };
            gamenet.C2SGameDeal(req, ()=>{});
        }
    },

    /** 处理倒计时 */
    doRefreshRound() {
        let roundNode = this.mainNode.getChildByName("round");
        let gameInfo = gameManager.getGameInfo();
        let { roundtime,op,roundstate } = gameInfo.round;
        let nowTime = (new Date()).getTime();
        if (roundtime > nowTime){
            roundNode.active = true;
            roundNode.showTime = (roundtime - nowTime)/1000;
            roundNode.getChildByName("round").angle = 90-gameInfo.uid2pos[op]*90;
            roundNode.getChildByName("time").getComponent(cc.Label).string = Math.ceil(roundNode.showTime);
        }
        else if (roundNode.active){
            // 超时
            roundNode.getChildByName("time").getComponent(cc.Label).string = "0";
        }
    },

    test() {
        // 测试手牌显示
        for (let idx=0; idx<13; ++idx){
            this.addHandCard(1, Math.round(idx/9)*100+21+idx%9);
        }
        this.addNewCard(121);
        // this.delHandCard(1, 121);    // card因为加载资源未生成，所以删除不了
        for (let idx=0; idx<13; ++idx){
            this.addHandCard(2, 11);
            this.addHandCard(3, 11);
            this.addHandCard(4, 11);
        }
        // 测试杠碰牌显示
        for (let idx=0; idx<4; ++idx){
            this.addDealCard(1, Math.round(idx/9)*100+11+idx%9, idx&1);
            this.addDealCard(2, Math.round(idx/9)*100+21+idx%9, idx&1);
            this.addDealCard(3, Math.round(idx/9)*100+31+idx%9, idx&1);
            this.addDealCard(4, Math.round(idx/9)*100+41+idx%9, idx&1);
        }
        // 测试已出牌显示
        for (let idx=0; idx<19; ++idx){
            this.addOutCard(1, Math.round(idx/9)*100+11+idx%9);
            this.addOutCard(2, Math.round(idx/9)*100+21+idx%9);
            this.addOutCard(3, Math.round(idx/9)*100+31+idx%9);
            this.addOutCard(4, Math.round(idx/9)*100+31+idx%9);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.frameTime = 0;    // 帧计时，记录每帧+1
        this.infoVersion = 0;   // 数据版本
        this.roundState = 0;    // 当前游戏状态
        // this.playerPos = {};    // 玩家逻辑位置{玩家id:pos}
        this.handCards = {};    // 手牌，{玩家id:{牌id:具体牌对象}}
        this.dealCards = {};    // 杠碰牌，{玩家id:{牌id:具体牌对象}}
        this.outCards = {};    // 已出牌，{玩家id:{牌id:具体牌对象}}
    },

    start () {
        this.init();
        this.initForPlayerInfo();
        // this.test();    // 单机测试
    },

    update (dt) {
        this.frameTime++;
        if (this.frameTime % 30 == 0){
            this.doLoadPlayerInfo();
            this.doCheckOperation();
            this.doRefreshRound();
        }
    },
});
