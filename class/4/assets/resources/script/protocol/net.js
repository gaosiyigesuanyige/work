var g_WS = null;
var g_Net = null;

/** 最大尝试发送次数 */
var MAX_SEND_TIMES = 3;

/** 接收服务器协议处理函数 */
var S2CFunc = {
    1:["loginnet","S2CLogin"], // 登录请求返回
    2:{ // 玩家信息
        1:["usernet","S2CInitUserInfo"],    // 初始化玩家信息
    },
    3:{
        1:["hallnet","S2CCreateRoom"],    // 创建房间
        2:["hallnet","S2CJoinRoom"],    // 加入房间
    }
}

/** 获取指定模块的函数 */
function getFunc(module, funcName){
    let mod = require(module);
    let func = mod[funcName];
    return func;
}

class CNet{
    /** 获取g_Net单例 */
    static getInstance(){
        if (!g_Net){
            g_Net = new CNet();
        }
        return g_Net;
    }
    constructor(){
        /** 保存c2s注册的回调，在s2c时触发 */
        this.seq = {};
        /** 连接成功标志 */
        this.connect = false;
    }
    /** 创建ws连接 */
    createWebSocket(cb){
        cc.log("createWebSocket");
        let user = require("./../user");
        let { wsURL } = user.getProp(["wsURL"]);
        g_WS = new WebSocket(wsURL);
        g_Net.init(cb);
    }
    /** 初始化操作，一般是监听ws，每次连接ws之后，都需要init一次 */
    init(cb){
        if (!g_WS){
            cc.log("WebSocket未连接");
            return;
        }
        g_WS.onopen = (res)=>{
            cc.log("WebSocket is connect");
            this.connect = true;
            if (cb){
                cb();
            }
        };
        g_WS.onmessage = (res)=>{
            this.message(res);
        };
        g_WS.onclose = (res)=>{
            cc.log("WebSocket is close");
            g_WS = null;
            // this.resetWebSocket();
        };
    }
    send(sub, data, cb, times){
        if (!times){
            times = 0;
        }
        if (!this.connect){ // 没连接时协议会每3秒间隔尝试发送多次
            if (times < MAX_SEND_TIMES){
                setTimeout(()=>{this.send(sub,data,cb,times+1)},1000);
            }
            return;
        }
        // 打包发送给服务器
        let req = { sub, data };
        g_WS.send(JSON.stringify(req));
        this.seq[sub] = cb;
    }
    message(messageEvent){
        var res = JSON.parse(messageEvent.data);
        let { sub,data } = res;
        cc.log("收到协议", sub);
        if (data.code){
            cc.log(g_Code[data.code]);
            return;
        }
        let temp;
        for (let idx of sub){
            if (!temp){
                temp = S2CFunc[idx];
            }
            else{
                temp = temp[idx];
            }
            if (!temp){
                break;
            }
        }
        if (temp){
            let func = getFunc(temp[0], temp[1]);
            cc.log(this.seq);
            func(data, this.seq[sub]);
            delete this.seq[sub];
        }
        else{
            cc.log(">>>>>>>>>>>>无效协议", sub);
        }
    }
    resetWebSocket(){
        if (g_WS){
            g_WS.close();
            g_WS = null;
        }
        this.connect = false;
        this.createWebSocket();
    }
}

module.exports = CNet;