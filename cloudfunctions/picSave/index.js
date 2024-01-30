// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取上传的图片文件（示例代码，具体实现依据实际情况）
  const fileStream = event.fileContent

  // 将文件存储到云存储
  const result = await cloud.uploadFile({
    cloudPath: "heartRecPic/1.jpg",
    fileContent: fileStream,
  })

  // 返回文件的 URL 或 ID
  return {
    fileID: result.fileID
  }

  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}