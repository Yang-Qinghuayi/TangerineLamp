// pages/index2/heartRoomLikeComment/heartRommLikeAndComment.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    mybasicdata:""
  },
  // 点击查看图片
  viewImage: function(e) {
      const src = e.currentTarget.dataset.src; // 假设你已经将图片的 URL 作为 data-src 设置到了 image 标签中
      wx.previewImage({
        urls: [src], // 需要预览的图片 HTTP 链接列表
      });
    },
  // 获取基础数据（不包括点赞与评论）
  getbasicData: function(){
    let that = this
    db.collection('index2HeartRoom_textAndpicture')
        .where({
          _id: this.data.id
        })
        .get({
          success: function(res) {
            console.log("查询成功", res);
            that.setData({
              mybasicdata: res.data[0]
            });
          },
          fail: function(err) {
            console.log('查询失败', err);
          }
        });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let temp = options.id + ""
    this.setData({
      id:temp
    })
    this.getbasicData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getbasicData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})