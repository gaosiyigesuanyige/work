cc.Class({
    extends: cc.Component,

    properties: {
        map:cc.Node,
        goal:cc.Node,
        prefabs:{
            default:[],
            type:cc.Prefab,
        },
        tankFrame:{
            default:[],
            type:cc.SpriteFrame,
        },
        bulletFrame:{
            default:[],
            type:cc.SpriteFrame,
        },
    },

    initTouch() {
        this.touchBeginKey = this.goal.on(cc.Node.EventType.TOUCH_START, (event)=>{
            if (!this.begin){
                this.begin = true;
            }
        });
        this.touchMoveKey = this.goal.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{
            if (!this.begin){
                event.stopPropagation();
                return;
            }
            let pos = event.getDelta();
            this.goal.x += pos.x;
            this.goal.y += pos.y;
            this.curPos = event.getLocation();
        });
        this.touchEndKey = this.goal.on(cc.Node.EventType.TOUCH_END, (event)=>{
            if (this.begin){
                this.begin = false;
            }
        });
    },

    doAddTank() {
        let newTank = cc.instantiate(this.prefabs[0]);  // 新坦克
        this.node.addChild(newTank);

        let [x, y] = [(Math.random()-0.5)*this.sceneW, (Math.random()-0.5)*this.sceneH];
        newTank.x = x;
        newTank.y = y;
        let newSprite = cc.find("sprite", newTank);
        newSprite.getComponent(cc.Sprite).spriteFrame = this.tankFrame[Math.min(4,Math.floor(Math.random()*5))];
        let ani = newSprite.getComponent(cc.Animation);
        ani.once("finished", ()=>{
            if (this.curPos){
                let newBulletPos = cc.find("bulletpos", newTank);
                let newPos = cc.v2(x+this.sceneW/2,y+this.sceneH/2);    // 新坦克基于左下角为远点的向量，与touch统一标准
                let ag = cc.v2(0,1).signAngle(this.curPos.sub(newPos)); //  计算上向量与新坦克面向touch的向量的弧度
                newTank.angle = 180*ag/Math.PI;
                let newBullet = cc.instantiate(this.prefabs[1]);    // 子弹
                newTank.addChild(newBullet);    // 子弹作为坦克子节点，方向直接受到坦克影响
                newBullet.x = newBulletPos.x;
                newBullet.y = newBulletPos.y;
                let lv = Math.min(2,Math.floor(Math.random()*3));   // 难度等级影响子弹型号，和速度上限
                let bulletSprite = cc.find("sprite", newBullet);
                bulletSprite.getComponent(cc.Sprite).spriteFrame = this.bulletFrame[lv];
                let moveTime = (Math.max(0.5-0.1*lv,Math.random()))*(this.curPos.sub(newPos).mag()/500);
                let tPos = newTank.convertToNodeSpace(this.curPos); // 把touch转换到相对于坦克的坐标
                newBullet.runAction(cc.sequence(    // 顺序执行动作
                    cc.moveBy(moveTime, tPos),    // 移动动作
                    cc.callFunc(()=>{   // 回调动作
                        let aniBullet = cc.find("sprite", newBullet).getComponent(cc.Animation);
                        aniBullet.once("finished", ()=>{    // 子弹爆炸完毕
                            ani.once("finished", ()=>{
                                newTank.removeFromParent();
                            });
                            ani.play("disappear");
                        });
                        aniBullet.play("blast");
                    })
                    )
                );
            }
            else{
                ani.once("finished", ()=>{
                    newTank.removeFromParent();
                });
                ani.play("disappear");
            }
        });
        ani.play("appear");
    },

    doCheck() {
        if (this.goal.getComponent("goal").isCollision){
            this.begin = false;
            this.goal.setPosition(this.initPos);
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.begin = false;
        this.times = 1;
        this.appearNum = 0;
        this.tempNum = 0;
        this.touchBeginKey = null;
        this.touchMoveKey = null;
        this.touchEndKey = null;
        this.curPos = null;
        let size = this.node.getContentSize()
        this.sceneW = size.width;
        this.sceneH = size.height;
        this.initPos = this.goal.getPosition();

        
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    start () {
        this.initTouch();
    },

    update (dt) {
        if (!this.begin){
            return;
        }
        if (Math.ceil(this.times) != Math.ceil(this.times + dt)){
            // one second
            let t = 1;
            if (this.times > t){
                this.times -= t;
                if (this.appearNum < t){
                    this.appearNum++;
                }
                this.tempNum += this.appearNum;
            }
            if (this.tempNum > 0){
                this.tempNum--;
                this.doAddTank();
            }
        }

        this.doCheck();

        this.times += dt;
    },

    // onDestroy() {
    //     if (this.touchBeginKey){
    //         this.node.off(cc.Node.EventType.TOUCH_START, this.touchBeginKey);
    //     }
    //     if (this.touchMoveKey){
    //         this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoveKey);
    //     }
    //     if (this.touchEndKey){
    //         this.node.off(cc.Node.EventType.TOUCH_END, this.touchEndKey);
    //     }
    // },
});
