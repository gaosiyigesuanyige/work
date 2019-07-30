var login = require("./login");

cc.Class({
    extends: cc.Component,

    properties: {
        /** 规则勾选对象 */
        checkRule:cc.Toggle,
        /** 规则界面 */
        ruleBG:cc.Node,
        /** 输入账号 */
        inputAccount:cc.EditBox,
        /** 输入密码 */
        inputPwd:cc.EditBox,
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

    /** 点击按钮，根据customEventData来区分 */
    onClickButton(event, customEventData) {
        switch (customEventData){
            case "勾选协议":{
                if (!this.checkRule.isChecked){
                    cc.audioEngine.playEffect(this.audioUIOut);
                    this.ruleBG.active = true;
                    this.ruleBG.getComponent(cc.Animation).play("openRule");
                }
                else{
                    cc.audioEngine.playEffect(this.audioButton);
                    this.ruleBG.getComponent(cc.Animation).play("hideRule");
                    this.ruleBG.getComponent(cc.Animation).once("finished", ()=>{
                        this.ruleBG.active = false;
                    });
                }
                break;
            }
            case "登录":{
                cc.log("登录");
                let account = this.inputAccount.string;
                let password = this.inputPwd.string;
                cc.log("登录账号:", account);
                login.Login({account,password}, (res)=>{
                    this.onLogin(res);
                });
                break;
            }
            case "注册":{
                cc.log("注册");
                let account = this.inputAccount.string;
                let password = this.inputPwd.string;
                cc.log("注册账号:", account);
                login.Regist({account,password}, (res)=>{
                    this.onRegist(res);
                });
                break;
            }
            default:{
                cc.log("未设置对按钮事件的处理", customEventData);
            }
        }
    },

    onInput(text, editbox, customEventData){
        if (!text || /^[0-9]+$/.test(text)){
            return;
        }
        editbox.string = "";
    },

    /** 登录结果回调 */
    onLogin(res) {
        let {code} = res;
        if (code == 0){
            cc.log("登录成功");
            cc.audioEngine.playEffect(this.audioFinish);
            cc.director.loadScene("hall");
        }
        else{
            cc.log("登录失败", code);
        }
    },

    /** 注册结果回调 */
    onRegist(res) {
        let {code} = res;
        if (code == 0){
            cc.log("注册成功");
            cc.audioEngine.playEffect(this.audioFinish);
        }
        else{
            cc.log("注册失败", code);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        cc.debug.setDisplayStats(false);
    },

    // update (dt) {},
});
