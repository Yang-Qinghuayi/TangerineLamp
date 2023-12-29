const db = wx.cloud.database();
let _id = "";

Page({
  data: {
    movie: {},
  },

  onLoad: function (options) {
    _id = options._id;
    wx.showLoading({
      title: "加载中",
    });
    this.getMovie(_id);
    wx.hideLoading();
    console.log(options);
  },

  // 获取文章内容
  getMovie(_id) {
    var that = this;
    db.collection("recommended_movie")
      .doc(_id)
      .get()
      .then((res) => {
        that.setData({
          movie: res.data,
        });
      });
  },
});
