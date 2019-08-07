var hallnet = require("./protocol/hallnet");
var usernet = require("./protocol/usernet");
var user = require("./user");

/** 枚举对应预制中的索引 */
var PREFAB_INDEX = {
    /** 数字按钮 */
    number:0,
    /** 显示 */
    show:1,
};

cc.Class({
    extends: cc.Component,

    properties: {
        handNode:cc.Node,
        panelJoin:cc.Node,
        showNode:cc.Node,
        numberNode:cc.Node,
        prefabList:{
            default:[], // [number, show]
            type:cc.Prefab,
        },
        audioButton:{
            default:null,
            type:cc.AudioClip,
        },
        audioFinish:{
            default:null,
            type:cc.AudioClip,
        },
        audioUIOut:{
            default:null,
            type:cc.AudioClip,
        },
    },

    init() {
        /** 显示输入房间号的label列表 */
        this.showNumList = [];
        /** 输入的房间号 */
        this.showNum = "";
    },

    initPanelJoin() {
        // 加载数字按钮
        let numAssetList = ["7","8","9","4","5","6","1","2","3","0","reset","delete"];
        for (let num of numAssetList){
            let path = "image/number/"+num;
            let numberNode = cc.instantiate(this.prefabList[PREFAB_INDEX.number]);
            this.numberNode.addChild(numberNode);
            this.addNumButtonListen(numberNode, num);
            cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame)=>{
                if (err){
                    cc.log("资源加载错误", path);
                    return;
                }
                numberNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
        }
        // 加载显示数字
        for (let num=0; num<6; num++){
            let showNode = cc.instantiate(this.prefabList[PREFAB_INDEX.show]);
            this.showNode.addChild(showNode);
            this.showNumList.push(showNode.getChildByName("num").getComponent(cc.Label));
        }
    },

    /** 添加数字按钮监听 */
    addNumButtonListen(numberNode, operation) {
        numberNode.on(cc.Node.EventType.TOUCH_END, ()=>{
            this.doInputNum(operation);
            cc.audioEngine.playEffect(this.audioButton);
        });
    },

    /** 处理数字按钮的输入操作 */
    doInputNum(operation){
        if (operation == "reset"){
            this.showNum = "";
        }
        else if (operation == "delete"){
            if (this.showNum.length > 0){
                this.showNum = this.showNum.substr(0, this.showNum.length-1);
            }
        }
        else{
            if (this.showNum.length < 6){
                this.showNum += operation;
            }
        }

        if (this.showNum.length == 6){  // 输入数量够了则清空显示，以及进入加入房间流程
            this.doJoinRoom(Number(this.showNum));
            this.showNum = "";
        }

        let index = 0;
        for (let num of this.showNum){  // 把需要显示的数字更新到label对象上
            this.showNumList[index].string = num;
            ++index;
        }
        while (index < 6){
            this.showNumList[index].string = "";
            ++index;
        }
    },

    doJoinRoom(roomID) {
        hallnet.C2SJoinRoom({roomID}, (res)=>{
            this.onJoinRoom(res);
        })
    },

    onJoinRoom(res) {
        let {code} = res;
        if (code == 0){
            cc.log("加入房间成功");
            cc.director.loadScene("room");
            cc.audioEngine.playEffect(this.audioFinish);
        }
        else{
            cc.log("加入房间失败");
        }
    },

    doCreateRoom() {
        hallnet.C2SCreateRoom({}, (res)=>{
            this.onCreateRoom(res);
        });
    },

    onCreateRoom(res) {
        let {code} = res;
        if (code == 0){
            cc.log("创建房间成功");
            cc.director.loadScene("room");
        }
        else{
            cc.log("创建房间失败");
        }
    },

    onClickButton (event, customEventData) {
        switch (customEventData){
            case "创建房间":{
                this.doCreateRoom();
                cc.audioEngine.playEffect(this.audioButton);
                break;
            }
            case "加入房间":{
                this.panelJoin.active = true;
                this.doInputNum("reset");   // 初始化显示
                cc.audioEngine.playEffect(this.audioUIOut);
                break;
            }
            case "关闭加入界面":{
                this.panelJoin.active = false;
                cc.audioEngine.playEffect(this.audioButton);
                break;
            }
            case "返回":{
                cc.director.loadScene("login");
                cc.audioEngine.playEffect(this.audioButton);
                break;
            }
            default:{
                cc.log("未设置对按钮事件的处理", customEventData);
            }
        }
    },

    onInitUserInfo(res) {
        let setUserInfo = (nodeName, val)=>{
            this.handNode.getChildByName(nodeName).getComponent(cc.Label).string = val;
        };
        let { code } = res;
        if (code == 0){
            let { nickname } = res;
            user.setProp({nickname});
            cc.log("玩家信息初始化");
            let { uid } = user.getProp(["uid"]);
            setUserInfo("id", uid);
            setUserInfo("name", nickname);
        }
        else{
            cc.log("玩家信息初始化失败");
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        usernet.C2SInitUserInfo({},(res)=>{
            this.onInitUserInfo(res);
        });
        this.init();
        this.initPanelJoin();
    },

    // update (dt) {},
});
