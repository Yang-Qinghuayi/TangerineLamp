// pages/index0/passage/passage.js
const db=wx.cloud.database()
const app = getApp()
const _ = db.command
let flag=true
let cnt = 0;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    collectedArticles: [], //文章详情列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    wx.showLoading({
      title: "加载中",
    });
    if (app.globalData.isLogin) {
      this.getData();
    } else {
      wx.showToast({
        title: "请先登录",
        duration: 1500,
        icon: "none",
      });
    }
    wx.hideLoading();
  },

  getData() {
    // 获取个人的文章收藏数据
    db.collection("collected_article")
      .where({
        _openid: app.globalData.openid,
      })
      .limit(8)

      .get()
      .then((res) => {
        this.setData({
          collectedArticles: res.data,
        });
      });
  },

  onReachBottom: function () {
    let oldData = this.data.collectedArticles;
    if(oldData.length<cnt){
      wx.showLoading({
        title: '加载中',
      })
      db.collection("collected_article ").skip(oldData.length).limit(8).where({
        _openid: app.globalData.openid,
      }).get().then(res=>{
        let newList = res.data;
        let newData = oldData.concat(newList);
        this.setData({
          collectedArticles :newData
        })
      })
      wx.hideLoading();
    }else{
      wx.showToast({
        title: '到底了哦',
        icon: 'success',
        duration: 1000
      })
    }
  }, 

  //  获得已收藏文章的数目
  getcount() {
    db.collection("colleted_article")
      .where({
        _openid: app.globaldata.openid,
      })
      .count()
      .then((res) => {
        cnt = res.total;
      });
  },
});