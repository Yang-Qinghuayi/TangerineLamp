// pages/index2/heartRecDetail/heartRecDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cur_year:'',
    cur_month_date:'',
    cur_question:"今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好",
    cur_answer:"别急,啊...我先来说两句,呐...先说哪两句呢?嗯...这次就先说这两句今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好后今日问题好好好好好好好好啊好好啊好今日问题好好好好好好好好啊好好啊好",
    imageList: []  // 存储图片的临时路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("来了: ",options)
    this.setData({
      cur_year : options.date.substring(0,4).toString(),
      cur_month_date: options.date.substring(5).toString()
    })
  },
  //取消编辑
  cancel:function(){
    wx.navigateBack({
      delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
    });
  },
  //保存编辑
  save:function(){
    //上传图片
    this.uploadImages()
    //保存文本
    //先别急...
  },
  // 更新 textarea 的值
  bindInput: function(e) {
    console.log("我来")
    this.setData({
      cur_answer: e.detail.value
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
  // 上传图片
  uploadImages: function() {
    this.data.imageList.forEach((imgPath) => {
      wx.compressImage({
        src: imgPath, // 图片路径
        quality: 75, // 压缩质量
        success(res) {
          // 读取图片文件为二进制数据
          wx.getFileSystemManager().readFile({
            filePath: res.tempFilePath,
            success: buffer => {
          // 调用云函数
            wx.cloud.callFunction({
              name: 'picSave', // 云函数名称
              data: {
               fileContent: buffer.data
              },
            success: res => {
              console.log('上传成功', res.result);
            },
            fail: err => {
              console.error('上传失败', err);
            }
          });
         },
            fail: console.error
         });
        }
      })
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