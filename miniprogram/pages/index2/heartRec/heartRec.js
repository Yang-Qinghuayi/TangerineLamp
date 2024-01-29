// pages/index2/heartRec.js
const date = new Date()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //心灵日记位置
    heartRecAddress:{
      1: "/pages/index2/heartRec/1/1",
      2: "/pages/index2/heartRec/2/2",
      3: "/pages/index2/heartRec/3/3",
      4: "/pages/index2/heartRec/4/4",
      5: "/pages/index2/heartRec/5/5",
      6: "/pages/index2/heartRec/6/6",
      7: "/pages/index2/heartRec/7/7",
      8: "/pages/index2/heartRec/8/8",
      9: "/pages/index2/heartRec/9/9",
      10: "/pages/index2/heartRec/10/10",
      11: "/pages/index2/heartRec/11/11",
      12: "/pages/index2/heartRec/12/12"
    },
    cur_date: '',
    cur_year: '',
    cur_question:"今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好"
  },
  /**
   * 跳转到对应月份的心灵日记详情查看页面
   */
  gotoHeartrecDetail: function(e) {
    let temp = e.currentTarget.dataset.month
    console.log("即将前往：",temp, this.data.heartRecAddress[temp])
    let tempurl = "/pages/index2/heartRecDetail/heartRecDetail?date=" + this.data.cur_year+"-"+temp+"月"+this.data.cur_date+"日";
    wx.navigateTo({
      url: tempurl
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("来了: ",options)
    this.setData({
      cur_date : options.date.substring(5).toString(),
      cur_year : options.date.substring(0,4).toString()
    })
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