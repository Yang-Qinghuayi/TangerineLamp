// pages/index0/index0.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    // 签到部分
    isQianDao: false,
    content: "每日签到",
    sentence: "甜菜就是99%的甜菜加上1%的甜菜",
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
    musicList: [], // 音乐列表
    movieList: [], // 电影列表
    picList: [], // 轮播图列表
    userInfo: {},
    hasUserInfo: false,

    //用于收藏文章的弹窗
    show_article: false,
    selected_article_id: "",
    selected_article: {},

    //用于收藏音乐的弹窗
    show_music: false,
    selected_music_id: "",

    //用于收藏电影的弹窗
    show_movie: false,
    selected_movie_id: "",
  },

  onClose() {
    this.setData({ show_article: false, show_music: false, show_movie: false });
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

  //根据长按得到目前操作的音乐
  collectMusicDialog(e) {
    let id = e.currentTarget.dataset.musicid;
    this.setData({ selected_music_id: id });
    this.setData({ show_music: true });
  },
  //收藏音乐
  collectMusic() {
    let that = this;
    //判断我是否已经收藏过这首音乐
    db.collection("collected_music")
      .where({
        music_id: this.data.selected_music_id,
        _openid: app.globalData.openid,
      })
      .get()
      .then((res) => {
        if (res.data.length != 0) {
          wx.showToast({
            title: "您已经收藏过这首音乐了",
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
          // 首先通过音乐id获取音乐的详细信息
          db.collection("recommended_music")
            .where({
              _id: that.data.selected_music_id,
            })
            .get()
            .then((res) => {
              //得到详细信息
              let music = res.data[0];

              //将文章信息存入数据库
              db.collection("collected_music")
                .add({
                  data: {
                    music_id: music._id,
                    cover_url: music.cover_url,
                    name: music.name,
                    singer: music.singer,
                    src: music.src,
                    push_time: music.push_time,
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
    this.setData({ show: false });
  },

  //根据长按得到目前操作的电影
  collectMovieDialog(e) {
    let id = e.currentTarget.dataset.movieid;
    this.setData({ selected_movie_id: id });
    this.setData({ show_movie: true });
  },

  //收藏电影
  collectMovie() {
    let that = this;
    //判断我是否已经收藏过这部电影
    db.collection("collected_movie")
      .where({
        movie_id: this.data.selected_movie_id,
        _openid: app.globalData.openid,
      })
      .get()
      .then((res) => {
        if (res.data.length != 0) {
          wx.showToast({
            title: "您已经收藏过这部电影了",
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
          //获取详细信息
          db.collection("recommended_movie")
            .where({
              _id: that.data.selected_movie_id,
            })
            .get()
            .then((res) => {
              //得到文章的详细信息
              let movie = res.data[0];

              //将文章信息存入数据库
              db.collection("collected_movie")
                .add({
                  data: {
                    movie_id: movie._id,
                    cover_url: movie.cover_url,
                    name: movie.name,
                    push_time: movie.push_time,
                    about: movie.about,
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
                });
            });
        }
      });
    this.setData({ show: false });
  },

  sign_in() {
    db.collection("index3_qiandao_daily")
      .add({
        data: {
          sentence: this.data.sentence,
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
        this.checkIsQianDao();
        wx.showToast({
          title: "签到成功",
          icon: "none",
          image: "",
          duration: 1500,
          mask: false,
          success: () => {},
          fail: () => {},
          complete: () => {},
        });
      });
  },

  //请求每日一句
  getOneWord() {
    // wx.request({
    //   url: "https://api.xygeng.cn/one",
    //   success: (res) => {
    //     this.setData({
    //       sentence: res.data.data.content,
    //     });
    //   },
    // });
    // 从数据库中获取每日一句
    db.collection("recommended_sentences")
      .where({
        date: this.data.isToday,
      })
      .get({
        success: (res) => {
          this.setData({
            sentence: res.data[0].sentence,
          });
        },
      });
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
    this.getMovieList();
    this.getMusicList();

    // 签到部分
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.setData({
      year: year,
      month: month,
      // isToday: "" + year + month + now.getDate(),
      isToday:
        "" +
        year +
        month.toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0"),
    });
    this.checkIsQianDao();
    this.getOneWord();
  },

  //获取轮播图片列表
  getPicList() {
    db.collection("index0_swiper")
      .get()
      .then((res) => {
        this.setData({
          picList: res.data,
        });
      });
  },

  // 获取热门文章列表
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

  // 音乐列表
  getMusicList() {
    db.collection("recommended_music")
      .orderBy("push_time", "desc")
      .get()
      .then((res) => {
        this.setData({
          musicList: res.data,
        });
      });
  },

  // 电影列表
  getMovieList() {
    db.collection("recommended_movie")
      .orderBy("push_time", "desc")
      .get()
      .then((res) => {
        this.setData({
          movieList: res.data,
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
