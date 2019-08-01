
/**
 * 用户自己的信息
 */

var User = {
    /** WebSocket连接的地址，可以是大厅，可以是房间 */
    wsURL:"",
    uid:0,
    account:0,
    passwd:0,
    nickname:"",
    roomID:0,

    /** 获取属性，传入key列表，返回字典 */
    getProp(list){
        let data = {};
        for (let key of list){
            data[key] = User[key];
        }
        return data;
    },
    /** 设置属性，传入字典，更新user */
    setProp(data){
        for (let key in data){
            User[key] = data[key];
        }
    },
}

module.exports = {
    getProp:User.getProp,
    setProp:User.setProp,
};