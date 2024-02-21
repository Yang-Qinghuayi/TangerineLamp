// pages/index2/Publish/Publish.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCustomToast: false,
    area:"",
    text:"",
    imageList: [],  // 存储图片的临时路径
    isPrivate: false, // 默认不私秘
    isComment: true, //默认允许评论
    isSubmit: true //默认投稿
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let Temp = options.Area + ""
    this.setData({
      area: Temp
    })
  },
  //取消编辑
  cancel:function(){
    wx.navigateBack({
      delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
    });
  },
  //保存编辑
  publish:function(){
    //上传图片且保存文本
    console.log("待完成")
  },
  // 更新 textarea 的值
  bindInput: function(e) {
    this.setData({
      text: e.detail.value
    });
  },
  // 点击图片上传，进行图片选择
  selectpic: function() {
    const that = this;
    wx.chooseImage({
      count: 50,  // 允许选择的图片数量
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          imageList: that.data.imageList.concat(tempFilePaths)
        });
        console.log("选择图片后的路径：",that.data.imageList)
      }
    });
  },
  // 删除(预览中)已上传图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    let imageList = this.data.imageList;
    imageList.splice(index, 1);  // 删除指定索引的图片
    this.setData({ imageList });
  },
  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
      // e.detail.value 是一个数组，包含了所有选中的checkbox的value值
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