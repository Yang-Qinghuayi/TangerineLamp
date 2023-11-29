const db = wx.cloud.database()
const app = getApp()
const _ = db.command;
var maxCount_comments = 0
var maxCount_sessions = 0

Page({
  data: {
    currentTab: 0, // 当前导航项id
    taskList: [{ // 所有导航项
      name: '评论'
    }, {
      name: '私聊'
    }],
    comments: [], //  评论区
    commentDetails: "", //  临时的存放textArea的变量
    color: null, //  样式
    theOpenid: null, // 用户的openid

    sessions: [], // 私聊会话区
    noMsg: true
  },

  /**
   * 从上一个内容中获取对应的id
   * @param {*} options 里面携带了对应的树洞id
   */
  onLoad(options) {
    this.setData({
      theOpenid: app.globalData.openid, //  获取游客的openid
    })
    this.updateRead()
  },

  onShow() {
    this.getComments()
    this.getMaxCount_comments()

    // 会话相关
    this.getSessions()
    this.getMaxCount_sessions()
  },

  // 处理导航项的点击事件
  handleClick(e) {
    let currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab
    })
  },

  // 处理左右滑动事件，切换不同页
  handleSwiper(e) {
    let {
      current,
      source
    } = e.detail
    if (source === 'autoplay' || source === 'touch') {
      const currentTab = current
      this.setData({
        currentTab
      })
    }
  },

  /**
   * 获取评论内容
   * 用户可以看到所有的评论内容
   */
  getComments() {
    console.log('openid', this.data.theOpenid)
    db.collection("index2_comments")
      .where(_.and([{
          _openid: _.not(_.eq(this.data.theOpenid))
        },
        {
          toID: this.data.theOpenid
        }
      ]))
      .orderBy('time', 'desc')
      .limit(10)
      .get()
      .then(res => {
        console.log('获得的评论：', res)
        this.setData({
          comments: res.data
        })
      })
  },

  /**
   * 获取私聊列表页内容
   * 用户可以看到关于自己的所有会话
   */
  getSessions() {
    console.log('openid', this.data.theOpenid)
     db.collection("index2_chat_user")
      .where({
        my_openid: _.eq(this.data.theOpenid)
      })
      .orderBy('updateTime', 'desc')
      .limit(10)
      .get()
      .then(res => {
        console.log('获得的会话：', res)
        this.setData({
          sessions: res.data
        })
        if (res.data.length != 0)
          this.setData({
            noMsg: false
          })
      })
  },

  /**
   * 获得评论的数量
   */
  getMaxCount_comments() {
    // 树洞主人获得所有的评论量
    db.collection('index2_comments')
      .where({
        toID: this.data.theOpenid
      })
      .count()
      .then(res => {
        maxCount_comments = res.total
      })
  },

  /**
   * 获得会话的数量
   */
  getMaxCount_sessions() {
    // 本人所有会话数量
    db.collection('index2_chat_user')
      .where({
        my_openid: this.data.theOpenid
      })
      .count()
      .then(res => {
        maxCount_sessions = res.total
      })
  },

  /**
   * 只要触底就进行更新
   * 直至将collection中的评论条目更新完
   */
  getMore_comments: function () {
    let oldData = this.data.comments;
    console.log(oldData)
    // 如果现在问题的数量小于问题总数量就下拉更新
    if (oldData.length < maxCount_comments) {
      // 显示加载条
      wx.showToast({
        icon: 'loading',
        duration: 500
      })
      // 开始更新下拉的数据
      // 树洞主人看到所有评论
      db.collection("index2_comments")
        .where({
          toID: this.data.theOpenid
        })
        .orderBy('time', 'desc')
        .skip(oldData.length)
        .limit(10)
        .get()
        .then(res => {
          // 将新条目进行缝合
          let newList = res.data
          let newData = oldData.concat(newList)
          // 缝合好的新老数据传给data中条目列表
          this.setData({
            comments: newData
          })
        })
    }
    // 如果现在问题的数量等于问题总数量就显示‘加载完毕’
    else {
      this.setData({
        isShowSubmit: true
      })
      wx.showToast({
        title: '到底了哦',
        icon: 'success',
        duration: 1000
      })
    }
  },


  /**
   * 会话页也是只要触底就进行更新
   * 直至将collection中的会话条目更新完
   */
  getMore_sessions: function () {
    let oldData = this.data.sessions;
    console.log(oldData)
    // 如果现在问题的数量小于问题总数量就下拉更新
    if (oldData.length < maxCount_sessions) {
      // 显示加载条
      wx.showToast({
        icon: 'loading',
        duration: 500
      })
      // 开始更新下拉的数据
      // 会话
      db.collection("index2_chat_user")
        .where({
          my_openid: this.data.theOpenid
        })
        .orderBy('updateTime', 'desc')
        .skip(oldData.length)
        .limit(10)
        .get()
        .then(res => {
          // 将新条目进行缝合
          let newList = res.data
          let newData = oldData.concat(newList)
          // 缝合好的新老数据传给data中条目列表
          this.setData({
            sessions: newData
          })
        })
    }
    // 如果现在问题的数量等于问题总数量就显示‘加载完毕’
    else {
      this.setData({
        isShowSubmit: true
      })
      wx.showToast({
        title: '到底了哦',
        icon: 'success',
        duration: 1000
      })
    }
  },


  /**
   * 前往details页面的函数
   */
  toDetail(res) {
    console.log("_treeholeid:", res.currentTarget.dataset.thistreeholeid)
    let tempid = res.currentTarget.dataset.thistreeholeid
    let tempurl = "/pages/index2/detailPage/detailPage?title=" + tempid
    wx.navigateTo({
      url: tempurl,
    })
  },

  /**
   * 前往chatPage页面的函数
   */
  toChatPage(res) {
    console.log(res)
    console.log("session_id:", res.currentTarget.dataset.session_id)
    let tempid = res.currentTarget.dataset.session_id
    let tempurl = "/pages/index2/chatPage/chatPage?session_id=" + tempid

    // 对方信息
    let hisUserInfo = {
      avatarUrl:res.currentTarget.dataset.avatarurl, // 头像
      nickName:res.currentTarget.dataset.nickname // 昵称
    }
    wx.navigateTo({
      url: tempurl,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据（即对方的个人信息）
        res.eventChannel.emit('sendhisUserInfo', hisUserInfo)
        console.log("跳转私聊界面成功！")
      }
    })
  },

  // 将未读变为已读
  updateRead() {
    db.collection('index2_comments').where(_.and([{
        _openid: _.not(_.eq(this.data.theOpenid))
      },
      {
        toID: this.data.theOpenid
      }
    ])).update({
      data: {
        isRead: true,
      }
    })
  }
})