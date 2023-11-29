// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

//引入模块
const newSession = require('./newSession/index');
const sendMsg = require('./sendMsg/index');
// const leaveSession = require('./leaveSession/index');

// 云函数：私聊模块（index2/chatPage）的数据库表增删改查
exports.main = async (event, context) => {
  // console.log(event);
  switch (event.type) {
    case 'newSession': // 建立私聊会话
      return await newSession.main(event, context);
    case 'sendMsg':   // 发送信息
      return await sendMsg.main(event, context);
    // case 'leaveSession': // 离开私聊会话
    //   return await leaveSession.main(event, context);
  }
}