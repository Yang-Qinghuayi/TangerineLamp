// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数：意见反馈模块(index4)的数据库表增删改查
exports.main = async (event, context) => {

  let db = cloud.database();

  // console.log(event);
  if(event.type == "add"){ //增加数据
    return await db.collection("index4_feedback").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _openid:event.openid,
        content:event.content,
        contact:event.contact,
        submitTime:Date.now()
      }
    })
    .then(res => {
      console.log(res)
      return {code:1}
    })
    .catch(res => {
      console.log(res)
      return {code:0}
    })
  }
  else if(event.type == "select"){ // 查询 (lookup连表查询，获取用户头像和昵称)
    
    var $ = cloud.database().command.aggregate   //定义聚合操作符
    return await db.collection("index4_feedback")
    .aggregate()
    .lookup({
      from:"User", //把 User 用户表关联上
      localField: '_openid', //表 index4_feedback 的关联字段
      foreignField: '_openid', //User 用户表的关联字段
      as: 'info', //匹配的结果作为 info 相当于起个别名
    })
    .sort({
      submitTime: -1
    })
    .replaceRoot({  
    //replaceRoot指定一个已有字段作为输出的根节点，也可以指定一个计算出的新字段作为根节点。
    //newRoot 代表新的根节点
      newRoot: $.mergeObjects([$.arrayElemAt(['$info', 0]), '$$ROOT'])
      
      //mergeObjects 累计器操作符
      //$.mergeObjects([params1,params2...]) 可以合并多个元素
      //$.arrayElemAt(['$info', 0]) 是取 info 数组的第一个元素（因为是数据是1对1，所以info 数组的也只有一个元素）
      //即取 info 数组的第一个元素，与原始的根融合在一起，作为新的输出
      
    })
    .project({
      //project把指定的字段传递给下一个流水线，指定的字段可以是某个已经存在的字段，也可以是计算出来的新字段
      // 舍弃info字段
      info: 0
    })
    .skip(event.skip_len)
    .limit(event.limit_len)
    .end({
      success:function(res){
        return res;
      },
      fail(error) {
        return error;
      }
    })
  }
}