// pages/index3/diary/diary.js
const db = wx.cloud.database();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    diary_list: [],
    openid: "",
    _id: "",
  },
  toDetail: function (e) {
    console.log("即将前往：", id, this.data.diary_list[id]);
    const id = e.currentTarget.dataset.dateid;
    console.log("param1", id);
    let year = this.data.diary_list[id].year;
    let month = this.data.diary_list[id].month;
    let day = this.data.diary_list[id].day;
    console.log("param2", year, month, day);
    let tempurl =
      "/pages/index2/heartRecDetail/heartRecDetail?date=" +
      year +
      "-" +
      month +
      "月" +
      day +
      "日";
    wx.navigateTo({
      url: tempurl,
    });
  },
  getData() {
    db.collection("index2HeartRec_commentAndpicture")
      .where({
        _openid: this.data.openid,
      })
      .limit(20)
      .get()
      .then((res) => {
        this.setData({
          diary_list: res.data,
        });
      });
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "小橘灯",
    });
    this.setData({
      openid: app.globalData.openid,
    });
    console.log(this.data.openid);
    wx.showLoading({
      title: "loading",
    });
    this.getData();
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
