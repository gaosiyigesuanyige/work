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
            net.getInstance().createWebSocket(()=>{
                loginnet.C2SLogin({pid:message.pid}, cb);
            });  // 触发创建ws连接
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
}