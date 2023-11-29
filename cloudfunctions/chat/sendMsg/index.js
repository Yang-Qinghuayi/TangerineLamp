const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 消息发送
exports.main = async (event, context) => {
  // 获取基础信息
  let {OPENID}=cloud.getWXContext();
  const db=cloud.database();
  const _=db.command;
  const sid=event.sid;//传参 会话号
  const msg_content = event.msg_content;//传参 消息内容 
  const sendType = event.sendType;//传参 发送的消息类型

  switch(sendType){
    case 'text':{ // 文字信息
      // 创建消息对象以保存到数据库
      const obj={
        createTimeStamp:Date.now(),
        creator: OPENID,
        content: msg_content ,
        type:'text'
      }
      //往chat_msg数据库表中推送消息，content是文字
      return db.collection('index2_chat_msg')
      .where({session_id: sid})
      .update({
            data:{
              msg_set:_.push(obj)
            }
      })
    }
    case 'image':{ // 图片类型
        // 创建消息对象以保存到数据库
        const obj={
          createTimeStamp:Date.now(),
          creator: OPENID,
          content: msg_content ,
          type:'image'
        }
        //往chat_msg数据库表中推送消息，content是FileID
        return db.collection('index2_chat_msg')
        .where({session_id: sid})
        .update({
          data:{
            msg_set:_.push(obj)
          }
        }) 
    }
    case 'video':{ // 视频类型
      const obj = {
        createTimeStamp:Date.now(),
        creator: OPENID,
        content: msg_content ,
        type:'video'
      }
      return db.collection('index2_chat_msg')
      .where({session_id: sid})
      .update({
        data:{
          msg_set:_.push(obj)
        }
      })
    }
    case 'file':{ // 文件类型
      const obj = {
        createTimeStamp:Date.now(),
        creator: OPENID,
        content: msg_content ,
        type:'file',
        fileName: event.fileName  // 文件类型特有字段
      }
      return db.collection('index2_chat_msg')
      .where({session_id: sid})
      .update({
        data:{
          msg_set:_.push(obj)
        }
      })
    }
    case 'audio':{ // 录音类型
      const obj = {
        createTimeStamp:Date.now(),
        creator: OPENID,
        content: msg_content ,
        type:'voice',
        duration: event.duration  // 录音类型特有字段
      }
      return db.collection('index2_chat_msg')
      .where({session_id: sid})
      .update({
        data:{
          msg_set:_.push(obj)
        }
      })
    }
  }
}