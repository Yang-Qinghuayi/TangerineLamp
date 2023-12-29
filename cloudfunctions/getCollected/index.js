// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const result = await db.collection("collected_article")
    .aggregate()
    .lookup({
      from: "index0_passageCollect",
      localField: "article_id",
      foreignField: "passage_id",
      as: "articleList",
    })
    .end()
    .catch((err) => {
      console.log(err);
    });
    
  return result
}