// pages/index4/feedBackDetail/feedBackDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    content: '',
    contact: '',
    submitTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      avatarUrl: options.avatarUrl,
      nickName: options.nickName,
      content: options.content,
      contact: options.contact,
      submitTime: Number(options.submitTime)
    })
  }
})