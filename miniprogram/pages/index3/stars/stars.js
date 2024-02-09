const db = wx.cloud.database();
const app = getApp();
Page({
  data: {
    showSign: false,
    tappedDate: "",
    tappedIndex: 0,
    day: "",
    content: "每日签到",
    alreadylist: [],
    year: 0,
    month: 0,
    date: ["日", "一", "二", "三", "四", "五", "六"],
    dateArr: [],
    isToday: "",
    isTodayWeek: false,
    todayIndex: 0,
    picList: [],
  },
  onLoad: function () {
    var picList = [];
    picList.push(
      "cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/LOGO/arrow-left.png"
    );
    picList.push(
      "cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/LOGO/arrow-right.png"
    );
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday:
        "" +
        year +
        month.toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0"),
      picList: picList,
    });
    this.setData({
      tappedDate: this.data.isToday,
      day: this.data.isToday.slice(6, 8),
    });
    this.checkIsQianDao();

    // 从dataarr中找到今天的index
    let today = this.data.isToday;
    for (let i = 0; i < this.data.dateArr.length; i++) {
      if (this.data.dateArr[i].isToday == today) {
        this.setData({
          tappedIndex: i,
        });
      }
    }
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth(); //没有+1方便后面计算当月总天数
    let nextMonth = month + 1 > 11 ? 1 : month + 1;
    let startWeek = new Date(year + "/" + (month + 1) + "/" + 1).getDay();
    //let startWeek = new Date(year, (month + 1), 1).getDay()  ;                        //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate(); //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        //设置date的参数
        obj = {
          isToday:
            "" +
            year +
            (month + 1).toString().padStart(2, "0") +
            num.toString().padStart(2, "0"),
          dateNum: num,
          isColor: false,
        };
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr,
    });

    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? setMonth + 1 : nowMonth;

    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek,
      });
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1,
      });
    }
  },
  check(event) {
    // 设置class
    console.log(this.todayIndex);
    let checkedDate = this.data.dateArr[event.mark.dateArrID].isToday;
    this.setData({
      tappedDate: checkedDate,
      day: checkedDate.slice(6, 8),
      tappedIndex: event.mark.dateArrID,
    });
    if (checkedDate > this.data.isToday) {
      this.setData({
        content: "那是未来的日子哦",
        showSign: false,
      });
      return;
    }
    if (checkedDate === this.data.isToday) {
      this.checkIsQianDao();
      return;
    }
    db.collection("index3_qiandao_daily")
      .where({
        _openid: app.globalData.openid,
        isToday: checkedDate,
      })
      .get({
        success: (res) => {
          if (res.data.length == 0) {
            console.log("未签到");
            this.setData({
              showSign: true,
              content: "补签",
            });
          } else {
            this.showSentence(checkedDate);
          }
        },
      });
  },

  // 展示当日的每日一句
  showSentence(date) {
    db.collection("recommended_sentences")
      .where({
        date: date,
      })
      .get()
      .then((res) => {
        if (res.data.length == 0) {
          this.setData({
            content: "甜菜就是99%的甜菜加1%的甜菜",
            showSign: false,
          });
        } else
          this.setData({
            content: res.data[0].sentence,
            showSign: false,
          });
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
              showSign: false,
              content: "去主页签到吧",
            });
          } else {
            this.showSentence(this.data.isToday);
          }
        },
      });
  },

  resign() {
    let checkedDate = this.data.tappedDate;
    wx.showLoading({
      title: "签到中",
      mask: true,
      success: (result) => {},
      fail: () => {},
      complete: () => {},
    });
    db.collection("index3_qiandao_daily")
      .add({
        data: {
          year: Number(this.data.tappedDate.slice(0, 4)),
          month: Number(this.data.tappedDate.slice(4, 6)),
          date: Number(this.data.tappedDate.slice(6, 8)),
          isToday: this.data.tappedDate,
          isColor: true,
        },
      })
      .then((res) => {
        db.collection("recommended_sentences")
          .where({
            date: checkedDate,
          })
          .get()
          .then((res) => {
            if (res.data.length == 0) {
              this.setData({
                content: "听我说",
                showSign: false,
              });
            } else
              this.setData({
                content: res.data[0].sentence,
              });
          });
        wx.hideLoading();
      });
  },

  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: month + 1,
      content: "",
      showSign: false,
    });
    this.dateInit(year, month);
  },
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: month + 1,
      content: "",
      showSign: false,
    });
    this.dateInit(year, month);
  },
});
