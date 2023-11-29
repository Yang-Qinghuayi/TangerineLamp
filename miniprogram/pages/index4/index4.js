// pages/index4/index4.js

// 获取应用实例
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    contact: '',
    contant: '',
    isDeveloper: false
  },
  onLoad(){
    this.setData({
      isDeveloper:app.globalData.isDeveloper
    })
  },

  // 反馈意见提交按钮点击事件
  formSubmit: function (e) {
    // 提交的前提是登录
    if (app.globalData.isLogin == false) {
      wx.switchTab({
        url: '/pages/index3/index3',
      })

      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 1500
      })
      return
    }

    let _that = this;
    let content = e.detail.value.opinion;
    let contact = e.detail.value.contact;
    let regPhone = /^1[3578]\d{9}$/;
    let regEmail = /^[a-z\d_\-\.]+@[a-z\d_\-]+\.[a-z\d_\-]+$/i;
    if (content == "") {
      wx.showModal({
        title: '提示',
        content: '反馈内容不能为空!',
      })
      return false
    }
    // if (contact == "") {
    //   wx.showModal({
    //     title: '提示',
    //     content: '手机号或者邮箱不能为空!',
    //   })
    //   return false
    // }

    // 联系方式若填写了，则需要验证手机号或者邮箱的格式是否正确
    if (contact != "" && (!regPhone.test(contact) && !regEmail.test(contact))) {
      wx.showModal({
        title: '提示',
        content: '您输入的手机号或者邮箱有误!',
      })
      return false
    }
    // 检验通过
    else {
      this.setData({
        loading: true
      })

      // 反馈存入数据库
      wx.cloud.callFunction({
          // 云函数名称
          name: 'feedback',
          // 传给云函数的参数
          data: {
            type: "add",
            openid: app.globalData.openid,
            content: content,
            contact: contact,
            submitTime :Date.now()
          }
        })
        .then(res => {
          console.log("反馈成功",res)
          wx.showToast({
            title: '反馈成功',
            icon: 'success',
            duration: 1200
          });
          // 清空输入框
          this.setData({
            content:null,
            contact:null
          })
        })
        .catch(err=>{
          console.log('反馈失败，请稍后再试',err)
          wx.showToast({
            title: '反馈失败',
            icon: 'error',
            duration: 1200
          });
        })

        this.setData({
          loading: false
        })
    }
  },

  // 小眼睛按钮
  goToFeedBackList(){
    wx.navigateTo({
      url: '/pages/index4/feedBackList/feedBackList'
    })
  }
})