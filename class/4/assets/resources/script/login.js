var http = require("./http");
var net = require("./protocol/net");
var loginnet = require("./protocol/loginnet");
var user = require("./user");

module.exports = {
    Login (data, cb) {
        let {account,passwd} = data;
        user.setProp({account,passwd});
        let url = http.url + `/login?account=${account}&passwd=${passwd}`;
        cc.log("请求登录",url);
        http.httpGets(url, (res)=>{
            cc.log("响应httpGets", res);
            let { message } = res;
            user.setProp({wsURL:message.address,uid:message.pid});
            net.getInstance().createWebSocket();  // 触发创建ws连接
            loginnet.C2SLogin({pid:message.pid}, cb);
        });
    },

    Regist(data, cb) {
        let {account,passwd} = data;
        let url = http.url + `/regist?account=${account}&passwd=${passwd}`;
        cc.log("请求注册",url);
        http.httpGets(url, (data)=>{
            cc.log(data);
        });
    },

    CreateRoom(data, cb) {
        cc.log("服务器收到创建房间协议");
        let {roomID} = data;
        
        {   // 模拟服务器操作
            let res = {
                code:roomID & 1,  // 为了测试，假设偶数房间ID为加入成功，否则失败
            };
            cb(res);
        }
    },

    JoinRoom(data, cb) {
        cc.log("服务器收到加入房间协议");
        let {roomID} = data;
        
        {   // 模拟服务器操作
            let res = {
                code:roomID & 1,  // 为了测试，假设偶数房间ID为加入成功，否则失败
            };
            cb(res);
        }
    },
}