const app = getApp()
const db = wx.cloud.database()
const monthList = ["1","2","3","4","5","6","7","8","9","10","11","12"]
const defaultImg = "cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/heartRecPic/logo.png"
// pages/index2/heartRec.js
const date = new Date()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //心灵日记位置
    heartRecAddress:{
      1: "/pages/index2/heartRec/1/1",
      2: "/pages/index2/heartRec/2/2",
      3: "/pages/index2/heartRec/3/3",
      4: "/pages/index2/heartRec/4/4",
      5: "/pages/index2/heartRec/5/5",
      6: "/pages/index2/heartRec/6/6",
      7: "/pages/index2/heartRec/7/7",
      8: "/pages/index2/heartRec/8/8",
      9: "/pages/index2/heartRec/9/9",
      10: "/pages/index2/heartRec/10/10",
      11: "/pages/index2/heartRec/11/11",
      12: "/pages/index2/heartRec/12/12"
    },
    cur_date: '',
    cur_year: '',
    cur_question:"",
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
    imageList:{//每个月的图片
      "1":[],
      "2":[],
      "3":[],
      "4":[],
      "5":[],
      "6":[],
      "7":[],
      "8":[],
      "9":[],
      "10":[],
      "11":[],
      "12":[]
    }
  },
  /**
   * 跳转到对应月份的心灵日记详情查看页面
   */
  gotoHeartrecDetail: function(e) {
    let temp = e.currentTarget.dataset.month
    console.log("即将前往：",temp, this.data.heartRecAddress[temp])
    let tempurl = "/pages/index2/heartRecDetail/heartRecDetail?date=" + this.data.cur_year+"-"+temp+"月"+this.data.cur_date+"日";
    wx.navigateTo({
      url: tempurl
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("来了: ",options)
    this.setData({
      cur_date : options.date.substring(5).toString(),
      cur_year : options.date.substring(0,4).toString()
    })
    this.getQuestion()
  },
   // 获取当日问题
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
  // 获取评论与图片
  getCommentPic:function(month){
    const that = this
    let openid = app.globalData.openid
    db.collection('index2HeartRec_commentAndpicture').where({
      _openid: openid,
      year: this.data.cur_year,
      month: month,
      day: this.data.cur_date
    }).field({
      picID: true,
      comment: true,
      isNone: true
    }).limit(100) // 限制返回结果数量
    .get({
      success: function(res) {
        console.log('查询成功', month,res.data.length);
       // 获取评论
       let monthKey = "commentList[" + month + "]"
       let imageKey = "imageList[" + month + "]"
       if(res.data.length==0){//当未查询到数据时，显示默认评论
        that.setData({
        [monthKey]:"等待你来探索...",
        [imageKey]: [defaultImg]
        })
       }
       that.setData({//当未查询到数据时，这段代码不会执行
         [monthKey]: (res.data[0].comment.length==0) ? "等待你来探索...":res.data[0].comment
       })
       // 获取图片
       let fileIDs = res.data.map(item => item.picID); // 将 fileID 提取出来
       console.log('fileIDs', fileIDs); // 打印包含所有 picID 的数组
      //  let imageKey = "imageList[" + month + "]"
       that.setData({//当未查询到数据时，这段代码不会执行
         [imageKey]: fileIDs
       })
      },
      fail: function(err) {
        console.error('查询失败', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("这里看看")
    monthList.forEach((month)=>
     this.getCommentPic(month)
    );
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})