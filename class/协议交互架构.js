// **************客户端部分**************
/**
 * 设计理念
 * 通过一个websocket服务通讯，发送一个json数据包
 * 数据包格式{
 *      sub:[1,2,3...],
 *      data,   // 字典
 * }
 * 其中：
 *      sub：协议号列表，[1]表示1号协议；[1,2,3]表示1号协议下，2号子协议下，3号次子协议
 *      data：具体此协议中发送给服务器的数据，由双端程序开发时约定
 * data中增加字段code，code：0-正常，其他-异常。
 * 比如code=1表示服务器报错，code=2表示登录异常，code=3表示密码错误
 */

//net.js    协议主要模块
/** 接收服务器协议处理函数 */
var S2CFunc = {
    1:S2CLogin, // 登录请求返回
    2:S2CRegist,    // 注册请求返回
}
// /** 客户端发送协议处理函数 */
// var C2SFunc = {
//     1:C2SLogin, // 登录请求
//     2:C2SRegist,    // 注册请求
//     3:{ // GM协议
//         1:C2SUpGrade, //    升级
//         3:C2SGiveItem,  // 获取道具
//     }
// }
//bag.js
/** 获取道具 */
function C2SGiveItem(itemID){
    let sub = [3,3];    // 3号协议下3号子协议
    let data = { itemID };
    CNet.getInstance().send(sub, data);
}
//net.js
var g_WS;   // WebSocket连接对象
var g_Net;  // CNet单例
class CNet{
    getInstance(){
        if (!g_Net){
            g_Net = CNet();
            g_Net.init();
        }
        return g_Net;
    }
    /** 初始化操作，一般是监听ws，每次连接ws之后，都需要init一次 */
    init(){
        g_WS.on("message", (res)=>{
            this.message(res);
        })
    }
    send(sub, data){
        // 打包发送给服务器
        req = { sub, data };
        g_WS.send(req);
    }
    message(res){
        let { sub,data } = res;
        console.log("收到协议", sub);
        if (data.code){
            console.log(g_Code[data.code]);
            return;
        }
        let temp;
        for (let idx of sub){
            if (!temp){
                temp = S2CFunc[sub];
            }
            else{
                temp = temp[sub];
            }
            if (!temp){
                break;
            }
        }
        if (temp){
            temp(data);
        }
        else{
            console.log(">>>>>>>>>>>>无效协议", sub);
        }
    }
}

//protocol.js   协议号
/** 记录所有大协议号，在添加协议的时候避免冲突 */
g_C2SProtocol = {
    1:"登录",
    2:"注册",
    3:"GM指令"
}
g_S2CProtocol = {
    1:"登录",
    2:"注册",
}

 // code.js
 g_Code = {
    0:"正确返回",
    1:"服务器报错",
    2:"登录异常",
    3:"密码错误",
 }



// **************服务端部分**************
/**
 * 设计理念同客户端部分
 * data中增加字段code，code：0-正常，其他-异常。
 * 比如code=1表示服务器报错，code=2表示登录异常，code=3表示密码错误
 */

 // code.js
 g_Code = {
    0:"正确返回",
    1:"服务器报错",
    2:"登录异常",
    3:"密码错误",
    4:"没有物品",
 }