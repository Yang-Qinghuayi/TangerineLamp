// pages/index0/index0.js
const app = getApp();
const db = wx.cloud.database();

import Dialog from "@vant/weapp/dialog/dialog";

Page({
  data: {
    // 签到部分
    isQianDao: false,
    content: "每日签到",
    nowdaycolor: "",
    alreadylist: [],
    year: 0,
    month: 0,
    date: ["日", "一", "二", "三", "四", "五", "六"],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,

    //几个图标
    passageIconSrc: "/icons/book-open.svg",
    musicIconSrc: "/icons/disc-3.svg",
    comicIconSrc: "/icons/brush.svg",
    radioIconSrc: "/icons/radio-icon.jpg",
    contactIconSrc: "/icons/contact-icon.jpg",
    passageList: [], // 热门文章列表
    comicList: [], // 热门漫画列表
    picList: [], // 轮播图列表
    userInfo: {},
    hasUserInfo: false,
  },

  sign_in() {
    if (this.data.isQianDao == true) {
      Dialog.alert({
        title: "签到",
        message: "今日已签到",
      }).then(() => {
        // on close
      });
    } else {
      wx.hideLoading();
      db.collection("index3_qiandao_daily")
        .add({
          data: {
            year: this.data.year,
            month: this.data.month,
            date: new Date().getDate(),
            nowdaycolor: "nowDay",
            isToday: this.data.isToday,
            isColor: true,
            isQianDao: true,
          },
        })
        .then((res) => {
          console.log(res);
        });

      Dialog.alert({
        title: "签到成功",
        message: "燕子,一定要幸福啊燕子!!!",
      }).then(() => {
        // on close
      });
      this.checkIsQianDao();
    }
  },

  signIn() {
    this.sign_in();
  },

  checkIsQianDao() {
    //查询今天是否已经签到
    db.collection("index3_qiandao_daily")
      .where({
        _openid: app.globalData.openid,
        isToday: this.data.isToday,
      })
      .get({
        success: (res) => {
          console.log("datay");
          console.log(res.data);
          if (res.data.length == 0) {
            this.setData({
              isQianDao: false,
            });
          } else {
            this.setData({
              isQianDao: true,
            });
          }
        },
      });
  },
  // 首页缓存
  initCache() {
    let openid = wx.getStorageSync("openid");
    let userInfo = wx.getStorageSync("userInfo");
    let hasUserInfo = wx.getStorageSync("hasUserInfo");
    let isDeveloper = wx.getStorageSync("isDeveloper");
    let isDoctor = wx.getStorageSync("isDoctor");
    let isCertiStudent = wx.getStorageSync("isCertiStudent");
    console.log("hasUserInfo", hasUserInfo);
    console.log("openid", openid);

    if (hasUserInfo == true) {
      app.globalData.openid = openid;
      app.globalData.userInfo = userInfo;
      app.globalData.hasUserInfo = hasUserInfo;
      app.globalData.isLogin = hasUserInfo;
      app.globalData.isDeveloper = isDeveloper;
      app.globalData.isDoctor = isDoctor;
      app.globalData.isCertiStudent = isCertiStudent;
    }
  },
  onLoad: function () {
    this.initCache();
    this.getPicList();
    this.getPassageList();
    this.getComicList();

    // 签到部分
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.setData({
      year: year,
      month: month,
      isToday: "" + year + month + now.getDate(),
      // picList: picList,
    });
    this.checkIsQianDao();
  },

  //获取轮播图片列表
  getPicList() {
    var picList = [];
    db.collection("index0_swiper")
      .get()
      .then((res) => {
        console.log(res.data);
        console.log("kissme");
        this.setData({
          picList: res.data,
          // picList:[{
          //   "src" : "https://avatars.githubusercontent.com/u/87259286?v=4",
          //   "id" : "1"
          // }]
        });
      });
  },

  // 获取热门文章列表
  getPassageList() {
    // 文章使用长图模式展示，从passageLongPicture集合获取，数据库模式从passage集合获取
    // 降序，越新的文章排在越前面
    db.collection("index0_passageLongPicture")
      .orderBy("pushTime", "desc")
      .get()
      .then((res) => {
        this.setData({
          passageList: res.data,
        });
      });
  },

  // 获取热门漫画列表
  getComicList() {
    // 降序，越新的漫画排在越前面
    db.collection("index0_comic")
      .orderBy("pushTime", "desc")
      .get()
      .then((res) => {
        this.setData({
          comicList: res.data,
        });
      });
  },
});
