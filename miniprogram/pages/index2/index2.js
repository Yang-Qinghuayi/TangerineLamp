// pages/index2/index2.js
const app = getApp()
const date = new Date()
const years = []
for (let i = 2000; i <= date.getFullYear(); i++) {
  years.push(i)
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
      exam: "/pages/index2/treeHole/6/exam"},
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
    tempTreeholeName: null, // 临时存放树洞名称的地方
    cur_question:"今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好",
    cur_date: '',
    cur_year: '',
    value: [9999],
    years
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
  bindChange1: function(e) {
    const val = e.detail.value
    this.setData({
      cur_year: this.data.years[val[0]].toString(),
    })
  },
  goToheartRec: function(e) {
    wx.navigateTo({
      url: "/pages/index2/heartRec/heartRec"
    })
  },

  onLoad(){
    let date = new Date();
    console.log(date.getDate())
    this.setData({
      cur_date : date.getDate().toString()
    })
    console.log('是否登录',app.globalData.isLogin,date)
  }
})