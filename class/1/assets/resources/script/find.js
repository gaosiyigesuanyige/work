// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    createSprite(sp){
        cc.loader.loadRes("image/test", cc.SpriteFrame, (err, res)=>{
            if (err){
                cc.log("加载错误");
                return;
            }
            sp.spriteFrame = res;
        });
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let node1 = cc.find("Canvas/find/sprite1");
        let sp1 = node1.getComponent(cc.Sprite);
        this.createSprite(sp1);
        
        let node2 = cc.find("sprite2", this.node);
        let sp2 = node2.getComponent(cc.Sprite);
        this.createSprite(sp2);

        let find = this.node.getComponent("find");
        cc.log(find,find==this);
    },

    start () {

    },

    // update (dt) {},
});
