const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

//云函数入口函数:新建私聊会话
exports.main = async (event, context) => {

  const sid = event.sid;
  const my_openid = event.my_openid;
  const his_openid = event.his_openid;
  const myUserInfo = event.myUserInfo;
  const hisUserInfo = event.hisUserInfo;

  //判断该联系请求是否为首次联系（index2_chat_msg中是否有会话记录）
  const isSid = await findSid(sid);
  let newSidResult = '';
  // 若已存在，返回 true
  if (isSid == true) {
    return {
      isSid: true
    }
  } 
  // 否则新建会话
  else {
    newSidResult = await newSid(sid,my_openid,his_openid,myUserInfo,hisUserInfo);
  }
  // 新建成功，返回 true
  if (newSidResult) {
    return {
      isSid: true
    }
  } else {
    return {
      isSid: false
    }
  }
}
// 查找是否存在此会话
async function findSid(sid) {
  const res = await cloud.database().collection('index2_chat_msg')
    .where({
      session_id: sid
    })
    .get();
  const len = res.data.length;
  if (len == 0) return false;
  else return true;
}

// 新建会话
async function newSid(sid,my_openid,his_openid,myUserInfo,hisUserInfo) {
  const db = cloud.database();
  const _ = db.command;
  try {
    //在集合 index2_chat_msg 中新增一条会话记录
    await db.collection('index2_chat_msg')
      .add({
        data: {
          session_id: sid,
          msg_set: []
        }
      });

    //在集合 index2_chat_user 中的新增一条用户对话关系记录（发起者->被动者）
    await db.collection('index2_chat_user')
    .add({
      data: {
        my_openid: my_openid,
        his_openid: his_openid,
        session_id: sid,
        isCertification: false,
        leaveTime: 0,
        unReadNum: 0,
        his_avatarUrl: hisUserInfo.avatarUrl,
        his_nickName: hisUserInfo.nickName
      }
    });

    //在集合 index2_chat_user 中的新增一条用户对话关系记录（被动者 -> 发起者）
    await db.collection('index2_chat_user')
    .add({
      data: {
        my_openid: his_openid,
        his_openid: my_openid,
        session_id: sid,
        isCertification: false,
        leaveTime: 0,
        unReadNum: 0,
        his_avatarUrl: myUserInfo.avatarUrl,
        his_nickName: myUserInfo.nickName
      }
    });
    return true;
  } 
  catch (err) {
    return false;
  }
}