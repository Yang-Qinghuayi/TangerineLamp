const db = wx.cloud.database();
let cnt = 0;
const app = getApp();

// let passageList = [];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    passageList: [],

    //用于收藏文章的弹窗
    show_article: false,
    selected_article_id: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
    });
    this.getPassageList();
    wx.hideLoading();
    this.getCount();
    wx.setNavigationBarTitle({
      title: "小橘灯",
    });
  },
  onClose() {
    this.setData({ show_article: false });
  },
  //根据长按得到目前操作的文章
  collectArticleDialog(e) {
    let id = e.currentTarget.dataset.articleid;
    this.setData({ selected_article_id: id });
    this.setData({ show_article: true });
  },
  //收藏文章
  collectArticle() {
    let that = this;
    //判断我是否已经收藏过这篇文章
    db.collection("collected_article")
      .where({
        article_id: this.data.selected_article_id,
        _openid: app.globalData.openid,
      })
      .get()
      .then((res) => {
        if (res.data.length != 0) {
          wx.showToast({
            title: "您已经收藏过这篇文章了",
            icon: "none",
            image: "",
            duration: 1500,
            mask: false,
            success: () => {},
            fail: () => {},
            complete: () => {},
          });
          this.setData({ show: false });
        } else {
          //首先通过文章id获取文章的详细信息
          db.collection("recommended_article")
            .where({
              _id: that.data.selected_article_id,
            })
            .get()
            .then((res) => {
              //得到文章的详细信息
              let article = res.data[0];

              //将文章信息存入数据库
              db.collection("collected_article")
                .add({
                  data: {
                    article_id: article._id,
                    author: article.author,
                    body: article.body,
                    introImage: article.introImage,
                    pushTime: article.pushTime,
                    title: article.title,
                  },
                })
                .then(() => {
                  wx.showToast({
                    title: "收藏成功",
                    icon: "none",
                    image: "",
                    duration: 1500,
                    mask: false,
                    success: () => {},
                    fail: () => {},
                    complete: () => {},
                  });
                  this.setData({ show: false });
                });
            });
        }
      });
  },
  // 获取文章列表
  getPassageList() {
    // 文章使用长图模式展示，从passageLongPicture集合获取，数据库模式从passage集合获取
    // 降序，越新的文章排在越前面
    db.collection("recommended_article")
      .orderBy("pushTime", "desc")
      .get()
      .then((res) => {
        this.setData({
          passageList: res.data,
        });
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  onReachBottom: function () {
    let oldData = this.data.passageList;
    if (oldData.length < cnt) {
      wx.showLoading({
        title: "加载中",
      });
      db.collection("recommended_article")
        .orderBy("pushTime", "desc")
        .skip(oldData.length)
        .limit(8)
        .get()
        .then((res) => {
          let newList = res.data;
          let newData = oldData.concat(newList);
          this.setData({
            passageList: newData,
          });
        });
      wx.hideLoading();
    } else {
      wx.showToast({
        title: "到底了哦",
        icon: "success",
        duration: 1000,
      });
    }
  },

  // 获得文章的数目
  getCount() {
    db.collection("recommended_article")
      .count()
      .then((res) => {
        cnt = res.total;
      });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
