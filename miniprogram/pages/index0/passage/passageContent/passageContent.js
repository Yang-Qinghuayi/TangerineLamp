const db = wx.cloud.database();
let _id = "";

Page({
  data: {
    passage: {},
  },

  onLoad: function (options) {
    _id = options._id;
    wx.showLoading({
      title: "加载中",
    });
    this.getPassage(_id);
    wx.hideLoading();
    console.log(options);
  },

  // 获取文章内容
  getPassage(_id) {
    var that = this;
    db.collection("recommended_article")
      .doc(_id)
      .get()
      .then((res) => {
        that.setData({
          passage: res.data,
        });
      });
  },
});
