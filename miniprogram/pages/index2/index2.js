// pages/index2/index2.js
const app = getApp()
const date = new Date()
const db = wx.cloud.database()
const monthList = ["1","2","3","4","5","6","7","8","9","10","11","12"]
const years = []
const dates = []
for (let i = 2000; i <= date.getFullYear(); i++) {
  years.push(i)
}
for (let i = 1; i <= date.getDate(); i++) {
  dates.push(i)
}
Page({
  

  /**
   * 页面的初始数据
   */
  data: {
    // 树洞位置
    TreeholeAddress: {
      work: "/pages/index2/treeHole/1/work",
      life: "/pages/index2/treeHole/2/life",
      emotion: "/pages/index2/treeHole/3/emotion",
      study: "/pages/index2/treeHole/4/study",
      game: "/pages/index2/treeHole/5/game",
      exam: "/pages/index2/treeHole/6/exam"
    },
    // 各个子树洞的图片
    work: "/pages/index2/logo/work.svg",
    game: "/pages/index2/logo/game.svg",
    emotion:"/pages/index2/logo/emotion.svg",
    exam:"/pages/index2/logo/exam.svg",
    life: "/pages/index2/logo/life.svg",
    study:"/pages/index2/logo/study.svg",
    // 轮播图
    picList: [
      "cloud://tangerine-cloud-9grdz5e80159e7b3.7461-tangerine-cloud-9grdz5e80159e7b3-1304921980/index2/slides/slide0.jpg",
      "cloud://tangerine-cloud-9grdz5e80159e7b3.7461-tangerine-cloud-9grdz5e80159e7b3-1304921980/index2/slides/slide1.jpg",
      "cloud://tangerine-cloud-9grdz5e80159e7b3.7461-tangerine-cloud-9grdz5e80159e7b3-1304921980/index2/slides/slide2.jpg",
      "cloud://tangerine-cloud-9grdz5e80159e7b3.7461-tangerine-cloud-9grdz5e80159e7b3-1304921980/index2/slides/slide3.jpg",
    ],
    commentList:{//每个月的评论
      "1":"",
      "2":"",
      "3":"",
      "4":"",
      "5":"",
      "6":"",
      "7":"",
      "8":"",
      "9":"",
      "10":"",
      "11":"",
      "12":""
    },
    tempTreeholeName: null, // 临时存放树洞名称的地方
    cur_question:"",
    cur_date: date.getDate().toString(),
    cur_year: date.getFullYear().toString(),
    valueYear: [9999],
    valueDate: [9999],
    years,dates
  },

  /**
   * 跳转到对应分区
   */
  gotoTreehole: function(e) {
    let temp = e.currentTarget.dataset.treeholename
    console.log("即将前往树洞：",temp, this.data.TreeholeAddress[temp])
    // let tempurl = this.data.TreeholeAddress + "?title=" + temp
    let tempurl = "/pages/index2/treeHole/treeHole?title=" + temp
    wx.navigateTo({
      url: tempurl
    })
  },

  /**
   * 跳转到树洞编辑页面
   */
  gotoPersonalEditor: function() {
    if (app.globalData.isLogin){
      wx.navigateTo({
        url: "/pages/index2/editPage/personalEditor"
      })
    }
    // 如果没有登录则提醒先登录
    else {
      wx.switchTab({
        url: '/pages/index3/index3',
      })
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      })
    }
  },
  bindYearPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index_year: e.detail.value
    })
  },
  // 年份选择的响应事件
  bindChangeYear: function(e) {
    const val1 = e.detail.value
    this.setData({
      cur_year: this.data.years[val1[0]].toString(),
    })
    // this.getQuestion() 由于目前每年的题目一样，所以这里在更新年份后，可以不用跟着更新问题
    monthList.forEach((month)=>
     this.getCommentPic(month)
    );
  },
  // 日期选择的响应事件
  bindChangeDate: function(e) {
    const val2 = e.detail.value
    this.setData({
      cur_date: this.data.dates[val2[0]].toString(),
    })
    this.getQuestion()
    monthList.forEach((month)=>
     this.getCommentPic(month)
    );
  },
  goToheartRec: function(e) {
    let tempurl = "/pages/index2/heartRec/heartRec?date=" + this.data.cur_year+"-"+this.data.cur_date;
    wx.navigateTo({
      url: tempurl
    })
    wx.navigateTo({
      url: "/pages/index2/heartRec/heartRec"
    })
  },

  onLoad(){
    // let date = new Date();
    // console.log(date.getDate())
    // this.setData({
    //   cur_date : date.getDate().toString()
    // })
    console.log('是否登录',app.globalData.isLogin,date)
  },

  getQuestion:function(){
    const that = this
    db.collection('index2HeartRec_question').where({
      day: that.data.cur_date
    }).field({
      question: true
    }).limit(100) // 限制返回结果数量
    .get({
      success: function(res){
        console.log("问题查询成功", res)
        that.setData({
          cur_question: res.data[0].question
        })
      },
      fail: function(err) {
        console.log('查询失败', err);
      }
    });
  },
   // 获取评论
   getCommentPic:function(month){
    const that = this
    let openid = app.globalData.openid
    db.collection('index2HeartRec_commentAndpicture').where({
      _openid: openid,
      year: this.data.cur_year,
      month: month,
      day: this.data.cur_date
    }).field({
      // picID: true,
      comment: true,
      isNone: true
    }).limit(100) // 限制返回结果数量
    .get({
      success: function(res) {
        console.log('查询成功', month,res.data.length);
       // 获取评论
       let monthKey = "commentList[" + month + "]"
      //  let imageKey = "imageList[" + month + "]"
       if(res.data.length==0){//当未查询到数据时，显示默认评论
        that.setData({
        [monthKey]:"等待你来探索..."
        // [imageKey]: [defaultImg]
        })
       }
       that.setData({//当未查询到数据时，这段代码不会执行
         [monthKey]: (res.data[0].comment.length==0) ? "等待你来探索...":res.data[0].comment
       })
       // 获取图片
      //  let fileIDs = res.data.map(item => item.picID); // 将 fileID 提取出来
      //  console.log('fileIDs', fileIDs); // 打印包含所有 picID 的数组
      //  let imageKey = "imageList[" + month + "]"
      //  that.setData({//当未查询到数据时，这段代码不会执行
      //    [imageKey]: fileIDs
      //  })
      },
      fail: function(err) {
        console.error('查询失败', err);
      }
    });
  },
  onShow() {
    this.getQuestion()
    monthList.forEach((month)=>
     this.getCommentPic(month)
    );
  },
})