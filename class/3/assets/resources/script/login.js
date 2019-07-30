var http = require("./http");

module.exports = {
    Login (data, cb) {
        cc.log("服务器收到登录协议");
        let {account,password} = data;

        {   // 模拟服务器操作
            let res = {
                /** 咱自己约定，code字段是服务器返回的【执行成功与否】的标志，int变量，0-执行成功，其他-失败原因 */
                code:password & 1,  // 为了测试，假设偶数密码为登录成功，否则失败
            };
            cb(res);
        }
    },

    Regist(data, cb) {
        cc.log("服务器收到注册协议");
        let {account,password} = data;
        {   // 模拟服务器操作
            let res = {
                code:password & 1,  // 为了测试，假设偶数密码为注册成功，否则失败
            };
            cb(res);
        }
    },
}