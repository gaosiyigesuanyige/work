
cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab,
        progressPrefab: cc.Prefab,
        scrollview: cc.ScrollView,
        desc: cc.Label,
    },
    /** 使用道具 */
    doUse() {
        // cc.log("doUse",this.items[this.checkItem])；
        if (this.items[this.checkItem]){
            this.progress.active = true;    // 显示进度条
            this.items[this.checkItem].destroy();   // 道具节点调用其销毁函数，会自动从节点树中清除
            delete this.items[this.checkItem];  // 删除引用
            this.checkItem = -1;
        }
    },
    /** 点击按钮 */
    onClickButton(event, data){
        if (this.progress.active){
            return;
        }
        // cc.log(event,data);
        if (data == 'close'){
            this.node.active = false;
        }
        else if (data == 'use'){
            this.doUse();
        }
    },
    /** 选中道具 */
    onCheckItem(event, data) {
        if (this.progress.active){
            return;
        }
        // cc.log(event,data);
        if (this.items[this.checkItem]){    // 把之前选中道具的【选中效果】去除
            this.items[this.checkItem].scale = 1;
        }
        this.checkItem = data;
        let desc = "";
        if (this.items[this.checkItem]){    // 给选中道具添加【选中效果】
            this.items[this.checkItem].scale = 0.8;
            desc = this.items[this.checkItem].desc;
        }
        this.desc.getComponent(cc.Label).string = desc; // 显示道具描述
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.items = {};    // 道具索引字典
        this.checkItem = -1;    // 选中道具的id，默认-1为未选择
    },

    start () {
        for (let idx=0; idx<100; idx++){    // 加载100个道具
            // 使用预制生成道具
            let fab;
            this.items[idx] = fab = cc.instantiate(this.itemPrefab);
            fab.setParent(this.scrollview.content);
            // 加载资源并使用
            cc.loader.loadRes("image/"+(idx%4+1), cc.SpriteFrame, (err, spriteframe)=>{
                if (err){
                    cc.log("error:",err);
                    return;
                }
                fab.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = spriteframe;
            });
            // 道具数量
            fab.getChildByName("num").getComponent(cc.Label).string = ""+Math.round(Math.random()*100);
            // 道具描述
            fab.desc = "你选中了道具"+idx;
            // 道具选中消息注册
            let click = new cc.Component.EventHandler();
            click.target = this.node;
            click.component = "bag";
            click.handler = "onCheckItem";
            click.customEventData = ""+idx;
            fab.getComponent(cc.Button).clickEvents.push(click);
        }
        // 进度条使用预制生成
        this.progress = cc.instantiate(this.progressPrefab);
        this.progress.setParent(this.node);
        this.progress.active = false;
    },

    update (dt) {
        if (this.progress.active){  // 进度条显示时执行
            let bar = this.progress.getComponent(cc.ProgressBar);
            if (bar.totalLength == 300){    // 进度达到300表示满了 ps：300是ccc的标准
                bar.totalLength = 0;    // 重置进度
                this.progress.active = false;   // 进场进度条对象
            }
            else{   // 进度条未满时每帧进度+1
                bar.totalLength = 1 + bar.totalLength;
            }
        }
    },
});
