const db = wx.cloud.database()
const app = getApp()
Page({
  data: {
    isResigning: false,
    isQianDao: false,
    content: "每日签到",
    alreadylist: [],
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    dateClicked: -1,
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    picList: [],
    sentence: [
      "把快乐放进重点反复背诵。",
      "可遇，可望，可期。",
      "随心、随缘、随喜。",
      "阅己，悦己，越己。",
      "自静，自醒，自清欢。",
      "不将就自己，不敷衍生活。",
      "清醒，知趣，明得失，知进退。",
      "永怀善意，清澈明朗，从始如一。",
      "万事，尽心尽力，而后，顺其自然。",
      "热爱漫无边际，生活自有分寸。",
      "各自乘流而上，互为欢喜人间。",
      "做一阵风吧，有温柔也有英勇。",
      "总觉得我应该成为更好的自己。",
      "每个灵魂里都有一朵玫瑰。",
      "在心里种花，人生才不会荒芜。",
      "人生，就是一场花时间爱自己的旅行。",
      "四季周而复始的更替，来年还是春风绕枝头。",
      "将昨日事，归欢喜处。",
      "睡前旧事归于尽，醒来依旧迎花开。",
      "一身温柔，满怀暖意，静度一生。"
    ],
    rand: ""
  },
  onLoad: function () {
    var picList = []
    picList.push("cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/LOGO/arrow-left.png")
    picList.push("cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/LOGO/arrow-right.png")
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + month + now.getDate(),
      picList: picList
    })
    this.getData();
    this.checkIsQianDao();
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth(); //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay();
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
          isToday: '' + year + (month + 1) + num.toString().padStart(2,"0"),
          dateNum: num,
          isColor: false,
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })

    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;

    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  checkIsQianDao() {
    //查询今天是否已经签到
    db.collection("index3_qiandao_daily")
      .where({
        _openid: app.globalData.openid,
        isToday: this.data.isToday
      })
      .get({
        success: res => {
          if (res.data.length == 0) {
            this.setData({
              isQianDao: false,
              content: "每日签到"
            })
          } else {
            this.setData({
              isQianDao: true,
              content: "今日已签到"
            })
          }
        }
      })
  },

  checkDate(date) {
    let flag = false
    for (let i = 0; i < alreadylist.arrLen(); i++) {
      if (this.data.alreadylist[i].isToday == date) {
        flag = true;
        break;
      }
    }
    return flag
  },

  getData() {
    let Arr = this.data.dateArr;
    db.collection("index3_qiandao_daily")
      .where({
        _openid: app.globalData.openid,
        month: this.data.month
      })
      .get()
      .then(res => {
        let resdata = res.data
        let d = new Date(this.data.year,this.data.month-1,1)
        let offset = d.getDay(); //此处获得该月份1号的星期数，0为星期日，6为星期六
        for (let i = 0; i < resdata.length; i++) {
          //[resdata[i].date + offset]代表该日期在表格中的位置
          Arr[resdata[i].date + offset-1].isColor = true
        }
        this.setData({
          dateArr: Arr
        })
      })
  },
  sign_in() {
    if (this.data.isQianDao == true) {
      wx.showToast({
        title: '您今日已经签到，请勿重复签到',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
        success: (result) => {

        },
        fail: () => {},
        complete: () => {}
      });

    } else {
      wx.showLoading({
        title: "签到中",
        mask: true,
        success: (result) => {

        },
        fail: () => {},
        complete: () => {}
      });
      this.setData({
        isQianDao: true,
        content: "今日已签到",
      })
      wx.hideLoading();

      db.collection("index3_qiandao_daily").add({
        data: {
          year: this.data.year,
          month: this.data.month,
          date: new Date().getDate(),
          isToday: this.data.isToday,
          isColor: true,
          isQianDao: true,
          isResigning: false
        }
      }).then(res => {

      })

      this.getData();
    }
  },
  resign() {
    wx.showLoading({
      title: "签到中",
      mask: true,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
    let Arr = this.data.dateArr;
    Arr[this.data.dateClicked].isColor = true;
    this.setData({
      content: "补签成功",
      dateArr: Arr
    })
    wx.hideLoading();
    db.collection("index3_qiandao_daily").add({
      data: {
        year: Number(this.data.dateArr[this.data.dateClicked].isToday.slice(0, 4)),
        month: Number(this.data.dateArr[this.data.dateClicked].isToday.slice(4, 6)),
        date: Number(this.data.dateArr[this.data.dateClicked].isToday.slice(6, 8)),
        isToday: this.data.dateArr[this.data.dateClicked].isToday,
        isColor: true,
        isQianDao: true,
        isResigning: true
      }
    }).then(res => {

    })

    this.getData();
  },

  haveSigned() {
    let dateClicked = this.data.dateArr[this.data.dateClicked].isToday;
    console.log(dateClicked);
    console.log(this.data.isToday);
    console.log(this.data.isToday > dateClicked);
    if (this.data.isToday > dateClicked) return;
    wx.showToast({
      title: '您今日已经签到，请勿重复签到',
      icon: 'none',
      image: '',
      duration: 1500,
      mask: false,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
  },
  
  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
    this.getData();
  },
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
    this.getData();
  },
  // 点击签到日期后展示每日一句
  onClickCheckedDate: function (event) {
    let index = Math.floor(Math.random() * this.data.sentence.length);
    this.setData({
      rand: this.data.sentence[index],
      dateClicked: event.mark.dateArrID,
      content: "今日已签到",
      isResigning: false
    })
  },
  //未签到提示补签
  onClickUncheckedDate: function (event) {
    let index = Math.floor(Math.random() * this.data.sentence.length);
    this.setData({
      rand: this.data.sentence[index],
      dateClicked: event.mark.dateArrID,
      content: "补签",
      isResigning: true
    })
  },
  onClickFutureDate: function (event) {
    this.setData({
      rand: "",
      dateClicked: event.mark.dateArrID,
      content: "✧*｡٩(ˊωˋ*)و✧*｡",
      isResigning: false
    })

  },
})