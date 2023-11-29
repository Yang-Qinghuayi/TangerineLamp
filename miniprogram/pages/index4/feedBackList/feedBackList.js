const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
var maxCount = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedBackList: [], // 反馈列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getfeedBackList();
    this.getMaxCount();
  },

  getfeedBackList() {
    // 调用意见反馈查询云函数
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'feedback',
      // 传递给云函数的event参数
      data: {
        type:'select',
        skip_len: 0,
        limit_len: 15
      }
    }).then(res => {
      console.log("意见反馈数据", res)
      this.setData({
        feedBackList: res.result.list
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //获取所有意见反馈数量
  getMaxCount() {
    db.collection('index4_feedback')
      .count()
      .then(res => {
        maxCount = res.total
      })
  },

  /**
   * 只要触底就进行更新
   * 直至将collection中的条目更新完
   */
  onReachBottom: function () {
    let oldData = this.data.feedBackList;
    console.log(oldData)
    // 如果数量小于总数量就下拉更新
    if (oldData.length < maxCount) {
      // 显示加载条
      wx.showToast({
        icon: 'loading',
        duration: 500
      })
      // 调用意见反馈查询云函数，开始更新下拉的数据
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'feedback',
        // 传递给云函数的event参数
        data: {
          type:'select',
          skip_len: oldData.length,
          limit_len: 10
        }
      }).then(res => {
        // 将新条目进行缝合
        let newList = res.result.list
        let newData = oldData.concat(newList)
        // 缝合好的新老数据传给data中条目列表
        this.setData({
          feedBackList: newData
        })
      }).catch(err => {
        // handle error
      })
    }
    // 如果现在数量等于总数量就显示‘加载完毕’
    else {
      wx.showToast({
        title: '到底了哦',
        icon: 'success',
        duration: 1000
      })
    }
  },
  goToDetail(res){
    console.log(res)
    let item = res.currentTarget.dataset.item
    wx.navigateTo({
      url: "/pages/index4/feedBackDetail/feedBackDetail"
      +"?avatarUrl=" + item.avatarUrl
      +"&nickName=" + item.nickName
      +"&content=" + item.content
      +"&contact=" + item.contact
      +"&submitTime=" + item.submitTime
    })
  }
})