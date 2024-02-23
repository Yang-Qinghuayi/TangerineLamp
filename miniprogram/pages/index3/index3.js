// index.js
// 获取应用实例
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    nickName: "",
    avatarUrl: "",
    dailyQianDaoCount: 0,
    year: 0,
    month: 0,
    messageCount: 0, //  需要展示的消息数量
    treeholesCount: 0, //  需要展示的树洞数量
    collectionCount: 0,
    colledtedArticleCount: 0,
    collectedMovieCount: 0,
    collectedMusicCount: 0,
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    // 为了保持解耦性，这两个只能从全局变量里面获得
    openid: null, //  用户的openid
    isDeveloper: false, //  用户的权限
    isDoctor: false,
    isCertiStudent: false,
    isLogin: false, //  用户是否登录
    isBooked: false, //用户是否有心理咨询预约记录
    hasAdvice: false, //数据库是否存在已预约心理咨询
    canIUseGetUserProfile: true,
  },
  // 跳转设置页面
  goToAddress() {
    wx.navigateTo({
      url: "/pages/index3/editor/editor",
      success: (result) => {},
      fail: () => {},
      complete: () => {},
    });
  },

  /**
   * 加载需要页面的各种信息和内容，包括可能的用户信息和权限
   */
  onLoad() {
    let openid = wx.getStorageSync("openid");
    let userInfo = wx.getStorageSync("userInfo");

    let hasUserInfo = wx.getStorageSync("hasUserInfo");
    let isDeveloper = wx.getStorageSync("isDeveloper");
    let isDoctor = wx.getStorageSync("isDoctor");
    let isCertiStudent = wx.getStorageSync("isCertiStudent");
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.setData({
      year: year,
      month: month,
    });
    //  已经登录过了
    // 清除缓存的时候要先更新
    this.data.hasUserInfo = app.globalData.hasUserInfo;
    if (app.globalData.isLogin || hasUserInfo == true) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: hasUserInfo,
        isDeveloper: isDeveloper,
        isDoctor: isDoctor,
        isCertiStudent: isCertiStudent,
      });
      app.globalData.openid = openid;
      app.globalData.isLogin = hasUserInfo;
      app.globalData.hasUserInfo = hasUserInfo;
      app.globalData.isDeveloper = isDeveloper;
      app.globalData.isDoctor = isDoctor;
      app.globalData.isCertiStudent = isCertiStudent;
      this.setData({
        isLogin: app.globalData.isLogin,
        isDeveloper: app.globalData.isDeveloper,
        isDoctor: app.globalData.isDoctor,
        isCertiStudent: app.globalData.isCertiStudent,
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      // app.globalData.isLogin = true
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: app.globalData.isLogin,
        });
      };
    }
    this.setUser();
    this.initOpenID(); //  获得openid
    // this.getUser();
  },
  onShow() {
    console.log("kissshow");
    // this.getUser();
    this.setUser();
  },
  modifyName() {
    wx.navigateTo({
      url: "/pages/index3/editor/update/update",
    });
  },
  getUser() {
    console.log("kissshow");
    db.collection("user")
      .where({
        _openid: app.globalData.openid,
      })
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({
          avatarUrl: res.data[0].avatarUrl,
          nickName: res.data[0].nickName,
        });
      });
  },
  setUser() {
    db.collection("user")
      .add({
        data: {
          avatarUrl: app.globalData.userInfo.avatarUrl,
          nickName: app.globalData.userInfo.nickName,
        },
      })
      .then((res) => {});
    console.log("kiss");
    db.collection("user")
      .where({
        _openid: app.globalData.openid,
      })
      .count()
      .then((res) => {
        if (res.total == 0) {
        }
      });
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        // 先将所有的信息传到全局变量里面
        app.globalData.userInfo = res.userInfo;
        app.globalData.isLogin = true;
        this.getdailyQianDaoCount(); //获取签到数量
        this.getUserTreeholeCount(); //  获取树洞数量
        this.getcollectionCount(); //获取收藏
        this.getUserMessageCount(); // 获取消息数量
        this.getAdviceCount(); // 获取个人用户预约
        this.getAdviceListCount(); //获取数据库全局预约
        // 将全局变量中的内容获取到本页
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: app.globalData.isLogin,
          isLogin: app.globalData.isLogin,
          isDeveloper: app.globalData.isDeveloper,
          isDoctor: app.globalData.isDoctor,
          isCertiStudent: app.globalData.isCertiStudent,
        });
        wx.setStorageSync("userInfo", res.userInfo);
        wx.setStorageSync("hasUserInfo", true);
        wx.setStorageSync("isDeveloper", app.globalData.isDeveloper);
        wx.setStorageSync("isDoctor", app.globalData.isDoctor);
        wx.setStorageSync("isCertiStudent", app.globalData.isCertiStudent);
      },
    });
  },

  onShow() {
    // this.getUserTreeholeCount()
    // this.getUserMessageCount()
    this.getdailyQianDaoCount();
    this.getcollectionCount();
    // this.getAdviceCount()
    // this.getAdviceListCount()
    this.data.hasUserInfo = app.globalData.hasUserInfo;
  },
  /**
   * 获取自己的签到天数
   */
  getdailyQianDaoCount() {
    db.collection("index3_qiandao_daily")
      .where({
        _openid: app.globalData.openid,
        // month: this.data.month,
        // year: this.data.year
      })
      .count()
      .then((res) => {
        this.setData({
          dailyQianDaoCount: res.total,
        });
      });
  },
  /**
   * 获取自己的文章收藏数量
   */
  getcollectionCount() {
    let articleCount = 0;
    db.collection("collected_article")
      .where({
        _openid: app.globalData.openid,
      })
      .count()
      .then((res) => {
        this.setData({
          colledtedArticleCount: res.total,
        });
        this.getMovieCount();
      });
  },

  getMovieCount() {
    db.collection("collected_movie")
      .where({
        _openid: app.globalData.openid,
      })
      .count()
      .then((res) => {
        this.setData({
          collectedMovieCount: res.total,
        });
        this.getMusicCount();
      });
  },

  getMusicCount() {
    db.collection("collected_music")
      .where({
        _openid: app.globalData.openid,
      })
      .count()
      .then((res) => {
        this.setData({
          collectedMusicCount: res.total,
        });
        this.setData({
          collectionCount:
            this.data.colledtedArticleCount +
            this.data.collectedMovieCount +
            this.data.collectedMusicCount,
        });
      });
  },

  /**
   * 前往认证通道
   */
  toCerti() {
    // 登录了才可以认证
    if (this.data.isLogin) {
      wx.navigateTo({
        url: "/pages/index3/certification/certification",
      });
    }
    // 否则提示要登录
    else {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 1500,
      });
    }
  },

  /**
   * 前往问卷通道
   */
  toQuest() {
    // 登录了才可以认证
    if (this.data.isLogin) {
      wx.navigateTo({
        url: "/pages/index3/student_questionnaire/student_questionnaire",
      });
    }
    // 否则提示要登录
    else {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 1500,
      });
    }
  },

  ///////////////////////获取openid并识别开发人员的一些列操作/////////////////////
  getOpenID: async function () {
    const { result } = await wx.cloud.callFunction({
      name: "login",
    });
    return result.userInfo.openId;
  },

  async try(fn, title) {
    try {
      await fn();
    } catch (e) {
      this.showError(title, e);
    }
  },

  async initOpenID() {
    return this.try(async () => {
      const openId = await this.getOpenID();
      wx.setStorageSync("openid", openId);
      this.getAuthority(openId);
      this.getDoctorAuth(openId);
      this.getCertiStudentAuth(openId);
      app.globalData.openid = openId;
    }, "初始化 openId 失败");
  },

  getAuthority(openId) {
    var that = this;
    let flag = false;
    db.collection("developer")
      .where({
        developer: openId,
      })
      .count()
      .then((res) => {
        if (res.total > 0) {
          flag = true;
          if (app.globalData.isDeveloper == !flag) {
            that.setData({
              isDeveloper: flag,
            });
            wx.setStorageSync("isDeveloper", flag);
          }
        } else {
          if (app.globalData.isDeveloper == !flag) {
            that.setData({
              isDeveloper: flag,
            });
            wx.setStorageSync("isDeveloper", flag);
          }
        }
        app.globalData.isDeveloper = flag;
      });
  },

  getDoctorAuth(openId) {
    var that = this;
    let flag = false;
    db.collection("doctors")
      .where({
        _openid: openId,
        isCertification: true,
      })
      .count()
      .then((res) => {
        if (res.total > 0) {
          flag = true;
          if (app.globalData.isDoctor == !flag) {
            that.setData({
              isDoctor: flag,
            });
            wx.setStorageSync("isDoctor", flag);
          }
        } else {
          if (app.globalData.isDoctor == !flag) {
            that.setData({
              isDoctor: flag,
            });
            wx.setStorageSync("isDoctor", flag);
          }
        }
        app.globalData.isDoctor = flag;
      });
  },
  getCertiStudentAuth(openId) {
    var that = this;
    let flag = false;
    db.collection("CertiStudent")
      .where({
        _openid: openId,
        isCertification: true,
      })
      .count()
      .then((res) => {
        if (res.total > 0) {
          flag = true;
          if (app.globalData.isCertiStudent == !flag) {
            that.setData({
              isCertiStudent: flag,
            });
            wx.setStorageSync("isCertiStudent", flag);
          }
        } else {
          if (app.globalData.isCertiStudent == !flag) {
            that.setData({
              isCertiStudent: flag,
            });
            wx.setStorageSync("isCertiStudent", flag);
          }
        }
        app.globalData.isCertiStudent = flag;
      });
  },

  // 工具函数 —— 获取今天的时间戳
  getNowDate() {
    let timestamp = Date.parse(new Date());
    let nowTime = new Date(timestamp);
    let year = nowTime.getFullYear();
    let month = nowTime.getMonth();
    let date = nowTime.getDate();
    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    let time = year + "/" + month + "/" + date;
    let nowDate = Date.parse(new Date(time));
    return nowDate;
  },
});
