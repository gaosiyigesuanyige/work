
var gameManager = require("./gameManager");
var user = require("./user");

function getNowOpCard() {
    let { round:{ roundtime,op,roundstate } } = gameManager.getGameInfo();
    let { out } = gameManager.getPlayerInfo(op);
    if (!out || out.length == 0){
        return 0;
    }
    return out[out.length-1];
}

function getSelfCard() {
    let { uid } = user.getProp(["uid"]);
    let cardInfo = gameManager.getPlayerInfo(uid);
    return cardInfo;
}

function isPeng(cid) {
    let { hand,deal,out,touch } = getSelfCard();
    if (!hand || hand.length == 0){
        return false;
    }
    let cardList = [cid];  // 记录参与处理的牌
    let num = 0;
    for (let cardID in hand){
        if (cardID == touch){
            continue;
        }
        if (cardID % 100 == cid % 100){
            num++;
            cardList.push(cardID);
        }
    }
    return num == 2 ? cardList : false;
}

function isGang(cid) {
    let { hand,deal,out,touch } = getSelfCard();
    if (!hand || hand.length == 0){
        return false;
    }
    let cardList = [cid];  // 记录参与处理的牌
    let num = 0;
    for (let cardID in hand){
        if (cardID == touch){
            continue;
        }
        if (cardID % 100 == cid % 100){
            num++;
            cardList.push(cardID);
        }
    }
    if (num == 0){
        for (let cardID in out){
            if (cardID % 100 == cid % 100){
                num++;
                cardList.push(cardID);
            }
        }
    }
    return num == 3 ? cardList : false;
}

function isHu(cid) {
    let { hand,deal,out,touch } = getSelfCard();
    if (!hand || hand.length == 0){
        return false;
    }
    let useGoal = false;
    let hasGeneral = false;
    let temp = {};
    for (let cardID in hand){
        if (cardID == touch){
            continue;
        }
        let val = cardID % 100;
        temp[val] = (tamp[val]||0)+1;
    }
    for (let idx in temp){
        if (temp[idx] == 1){
            if (useGoal){   // 已计算目标牌
                return false;
            }
            useGoal = true;
            if (hasGeneral){    // 已有将
                return false;
            }
            hasGeneral = true;
        }
        else if (temp == 2){
            if (hasGeneral){    // 已有将
                return false;
            }
            hasGeneral = true;
        }
    }
    return hasGeneral;

}

module.exports = {
    getNowOpCard,
    isGang,
    isPeng,
    isHu,
}