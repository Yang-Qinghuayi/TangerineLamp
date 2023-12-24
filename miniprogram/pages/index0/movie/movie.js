const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    movieList: [],
    //用于收藏电影的弹窗
    show_movie: false,
    selected_movie_id: "",
  },

  //根据长按得到目前操作的电影
  collectMovieDialog(e) {
    let id = e.currentTarget.dataset.movieid;
    this.setData({ selected_movie_id: id });
    this.setData({ show_movie: true });
  },

  //收藏电影
  collectMovie() {
    db.collection("collected_movie")
      .add({
        data: {
          movie_id: this.data.selected_movie_id,
        },
      })
      .then((res) => {
        wx.showToast({
          title: "收藏成功",
          icon: "none",
          image: "",
          duration: 1500,
          mask: false,
          success: (result) => {},
          fail: () => {},
          complete: () => {},
        });
        this.setData({ show_movie: false });
      });
  },

  onClose() {
    this.setData({ show_movie: false });
  },

  // 获取音乐列表
  getMovieList() {
    // 降序，越新的音乐排在越前面
    db.collection("recommended_movie")
      .orderBy("push_time", "desc")
      .get()
      .then((res) => {
        this.setData({
          movieList: res.data,
        });
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMovieList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
