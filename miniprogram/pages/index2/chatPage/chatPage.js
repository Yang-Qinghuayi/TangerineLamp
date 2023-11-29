const App = getApp();
const db = wx.cloud.database();
const _ = db.command;
var msgWatcher = null;
const recorderManager = wx.getRecorderManager(); //录音
const innerAudioContext = wx.createInnerAudioContext(); //播放语音
var loading = true;
Page({

  data: {
    sid: '', // 当前会话ID
    recordimg: '../logo/voice.png', // 发语音时中间的图标
    recording: false, // 当前是否正在录音
    voiceTip: '按住 说话', // 底部录音提示
    showtip: '上滑取消', // 中间录音提示
    cancelSendStatus: false, // 是否取消录音
    inputMode: 'text', // 当前输入方式（文字text或语音voice）
    InputBottom: 0, // 输入框距离底部距离
    inputContent: '', // 输入的文字
    scrollId: '', // 聊天记录中当前定位到的消息的 scroll id
    modalName: null, // 控制点击加号后弹出选择框
    systemInfo: {}, // 系统界面信息
    myOpenid: App.globalData.openid, // 我的 openId
    myUserInfo: App.globalData.userInfo, // 我的信息（昵称和头像信息），  此处仍未成功获取到userInfo
    hisUserInfo: '', // 他的信息（昵称和头像信息）
    msgList: [], // 消息数组
    fileImg: '../logo/file.png' // 文件图标
  },

  // 生命周期-加载函数
  onLoad: async function (e) {
    console.log(e)

    loading = true;
    if (msgWatcher) await msgWatcher.close();
    console.log('进入会话页，携带会话号', e.session_id);

    // 监听 sendhisUserInfo 事件，获取上一页面通过eventChannel传送到当前页面的数据
    let hisUserInfo;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('sendhisUserInfo', function (data) {
      hisUserInfo = data;
      console.log("hisUserInfo", hisUserInfo);
    })

    // 获取聊天记录数组
    let msgList;
    // db.collection('index2_chat_msg')
    // .where({  
    //   session_id: e.session_id,
    // })
    // .get({
    //   success: function (res) {
    //     // res.data 包含该记录的数据
    //     console.log("此会话聊天记录",res.data)
    //     msgList = res.data; 
    //   }
    // })

    this.setData({
      sid: e.session_id,
      myOpenid: App.globalData.openid,
      myUserInfo: App.globalData.userInfo,
      hisUserInfo: hisUserInfo,
      msgList: msgList
    })
    var that = this;
    //获取系统信息，得到可用窗口高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          systemInfo: res,
        })
      }
    })
    //开启集合 chat_msg.session_id 的消息监听
    setTimeout(this.initWatcher, 1000)
    //初始化录音器
    this.initRecord();
  },
  //消息监听器开启
  async initWatcher() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    console.log('initWatcher函数执行，消息监听器开启');
    // 监听数据库中当前会话消息的变化
    msgWatcher = await db.collection('index2_chat_msg')
      .where({
        session_id: this.data.sid,
      })
      .watch({
        onChange: this.onChange.bind(this),
        onError: function (err) {
          console.log("onError", err);
          wx.showModal({
            title: '提示',
            content: '数据监听失败',
            showCancel: false,
            confirmText: '重新加载',
            success(res) {
              if (res.confirm) {
                that.onLoad();
              }
            }
          })
        }
      })
  },
  //消息监听回调函数
  async onChange(snapshot) {
    console.log('onChange监听回调函数的snapshot', snapshot)
    //即时聊天渲染
    var list = snapshot.docs[0].msg_set;

    // 对消息对象数组进行时间排序，若本来就是有序的则无需排序
    // console.log('排序渲染函数执行');
    // list = list.sort(function (a, b) {
    //   return a.createTimeStamp - b.createTimeStamp
    // });

    await this.setData({
      msgList: list,
      scrollId: 'msg-' + (list.length - 1)
    });
    if (loading == true) {
      wx.hideLoading({
        complete: () => {
          loading = false
        },
      })
    }
  },

  //输入框控制 (聚焦时输入法将把输入框顶起来)
  InputFocus(e) {
    this.setData({
      InputBottom: e.detail.height
    })
  },
  InputBlur(e) {
    this.setData({
      InputBottom: 0
    })
  },
  //点击+号时显示底部窗口
  showModal(e) {
    this.setData({
      modalName: "bottomModal"
    })
  },
  //点击取消时隐藏底部窗口
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //获取输入框内容
  onInputContent(e) {
    this.data.inputContent = e.detail.value
  },
  //发送文字函数//调用了云函数 chat.sendMsg
  sendContent() {
    var that = this;
    console.log("点击了发送")
    if (!this.data.inputContent) {
      return
    } else {
      let text = this.data.inputContent;
      // 输入框清空
      this.setData({
        inputContent: ''
      })
      // 调用云函数，发送消息到服务器
      wx.cloud.callFunction({
          name: 'chat',
          data: {
            type: 'sendMsg',
            msg_content: text,
            sid: that.data.sid,
            sendType: 'text',
          }
        })
        .then((res) => {
          console.log('云函数senMsg调用成功', res)
        })
        .catch((err) => {
          console.log('调用云函数sendMsg失败', err);
          wx.showToast({
            title: '发送失败',
            icon: 'error'
          })
        })
    }
  },
  //发送图片
  sendPic() {
    var that = this;
    //选择图片
    wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          console.log('chooseImage调用成功', res.tempFilePaths[0]);
          var path = res.tempFilePaths[0];

          //图片上传云存储
          wx.cloud.uploadFile({
              cloudPath: 'index2/chat-image/' + Date.now() + '.png',
              filePath: path
            })
            .then(res => {
                wx.showLoading({
                  title: '图片发送中',
                  mask: true
                })
                console.log('图片上传成功');
                const fileID = res.fileID;

                // 调用云函数，图片类型消息发送
                wx.cloud.callFunction({
                  name: 'chat',
                  data: {
                    type: 'sendMsg',
                    sendType: 'image',
                    sid: that.data.sid,
                    msg_content: fileID
                  },
                  success: res => {
                    console.log('云函数sendMsg成功:图片', res);
                  },
                  fail: res => {
                    console.log(res);
                    wx.showToast({
                      title: '发送失败',
                      icon: 'error'
                    })
                  },
                  complete: res => {
                    wx.hideLoading();
                    that.hideModal();
                  }
                })
            })
        } 
    })
},
//点击图片预览
viewImage(e) {
  var urls = [e.currentTarget.dataset.url]
  wx.previewImage({
    current: '', // 当前显示图片的http链接
    urls: urls, // 需要预览的图片http链接列表
    showmenu: true
  })
},
//发送视频
sendVideo() {
  var that = this;
  console.log("sendVideo");
  wx.chooseMedia({
    count: 1,
    mediaType: ['video'],
    sourceType: ['album', 'camera'],
    maxDuration: 30,
    camera: 'back',
    success(res) {
      const time = Date.now();
      console.log('视频的临时文件路径', res.tempFiles[0].tempFilePath)
      // 视频上传云存储
      wx.cloud.uploadFile({
          cloudPath: 'index2/chat-video/' + time + '.mp4',
          filePath: res.tempFiles[0].tempFilePath
        })
        .then((res) => {
          wx.showLoading({
            title: '视频发送中',
            mask: true
          })
          console.log('视频上传成功',res);
          const fileID = res.fileID;

          // 调用云函数，视频类型消息发送
          wx.cloud.callFunction({
            name: 'chat',
            data: {
              type: 'sendMsg',
              sendType: 'video',
              sid: that.data.sid,
              msg_content: fileID
            },
            success: res => {
              console.log('云函数推送视频消息到会话消息数组')
            },
            fail: res => {
              console.log(res)
            },
            complete: res => {
              wx.hideLoading();
              that.hideModal();
            }
          })

        })
    }
  })
},
//发送文件
sendFile() {
  var that = this
  wx.chooseMessageFile({
    count: 1, //能选择文件的数量
    type: 'file', //能选择文件的类型,我这里只允许上传文件
    success(res) {
      const tempFilePaths = res.tempFiles[0].path; //文件临时路径     
      const fileName = res.tempFiles[0].name; //文件名
      //保证文件名长度在20内
      //if(fileName.length>20){fileName = fileName.substr(0,20)+'...'}
      const houzhui = tempFilePaths.match(/\.[^.]+?$/)[0]; //后缀名的获取
      const cloudpath = 'index2/chat-file/' + Date.now() + houzhui; //存储在云存储的地址
      /// 文件上传云存储,获取fileID
      wx.cloud.uploadFile({
        cloudPath: cloudpath,
        filePath: tempFilePaths,
        success: res => {
          wx.showLoading({
            title: '文件发送',
            mask: true
          })

          const fileID = res.fileID
          // 调用云函数，视频类型消息发送
          wx.cloud.callFunction({
            name: 'chat',
            data: {
              type: 'sendMsg',
              sendType: 'file',
              sid: that.data.sid,
              msg_content: fileID,
              fileName: fileName
            },
            success: res => {
              console.log('云函数推送文件消息到会话消息数组')
            },
            fail: res => {
              console.log(res)
            },
            complete: res => {
              wx.hideLoading();
              that.hideModal();
            }
          })
        },
        fail: err => {
          console.log('wx.chooseMessageFile', err)
        },
      })
    }
  })
},
//打开文件
viewFile(e) {
  var fileid = e.currentTarget.dataset.fileid; //云文件fileID
  var that = this;
  wx.cloud.downloadFile({
      fileID: fileid,
    })
    .then((res) => {
      console.log('res', res.tempFilePath);
      wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
        })
        .then(() => {})
        .catch((err) => {
          console.log('文件预览失败', err);
        })
    })
},
//切换输入模式
switchInputMode() {
  this.setData({
    inputMode: this.data.inputMode === 'text' ? 'voice' : 'text'
  })
},
//初始化录音器
initRecord() {
  console.log('初始化录音器');
  //监听录音开始事件
  recorderManager.onStart(() => {
    console.log('开始录音');

  });
  //监听录音结束事件
  recorderManager.onStop((res) => {
    console.log('录音结束回调')
    if (this.data.cancelSendStatus) {
      console.log('取消录音');
      this.data.cancelSendStatus = false;
      return
    };
    console.log(res);
    let src = res.tempFilePath;
    let duration = res.duration;
    if (duration <= 1000) {
      console.log('stop,说话时间太短')
      wx.showToast({
        title: '说话时间太短',
        icon: 'error'
      })
      return
    } else {
      // 语音持续时间
      duration = Math.floor(res.duration / 1000);
    }
    //录音上传云存储,获取fileID
    wx.cloud.uploadFile({
        cloudPath: 'index2/chat-audio/' + Date.now() + ".aac",
        filePath: src
      })
      .then((res) => {
        console.log('录音上传云存储成功', res);
        //语音消息
        const fileID = res.fileID
        // 调用云函数，语音类型消息发送
        wx.cloud.callFunction({
            name: "chat",
            data: {
              type: 'sendMsg',
              sendType: 'audio',
              msg_content: fileID,
              sid: this.data.sid,
              duration: duration
            }
          })
          .then((res) => {
            console.log('调用云函数（语音）成功')
          })
      })
      .catch((res) => {
        console.log('失败', res);
        wx.showToast({
          title: '发送失败',
          icon: 'error'
        })
      })
  })
  //错误回调
  recorderManager.onError((res) => {
    console.log('录音错误回调', res);
  })
},
//开始录音
async RecordStart(e) {
    console.log('手指触摸', e)
    var startY = e.touches[0].clientY; //初始Y坐标
    this.data.startY = startY;
    recorderManager.start();
    this.setData({
      recording: true,
      voiceTip: '松开 发送',
      showtip: '上滑取消',
    });
  },
  //手指移动
  RecordMove(e) {
    var moveY = e.touches[0].clientY; //移动的Y坐标
    if (this.data.startY - moveY >= 100) {
      this.setData({
        cancelSendStatus: true,
        showtip: '松开手指，取消发送',
      });
    } else {
      this.setData({
        cancelSendStatus: false,
        showtip: '上滑取消',
      });
    }
  },
  //松开手指录音停止
  async RecordEnd(e) {
      console.log('手指松开');
      var that = this;
      setTimeout(f, 100);

      function f() {
        that.setData({
          voiceTip: '按住 发送',
          recording: false
        }, () => {
          recorderManager.stop();
        });
      }
    },
    //播放录音
    voicePlay(e) {
      innerAudioContext.stop();
      innerAudioContext.src = '';
      // 获取录音的id
      console.log("录音的id",e.currentTarget.dataset.voiceid)
      let id = e.currentTarget.dataset.voiceid;

      // 播放
      innerAudioContext.src = id;
      console.log('语音播放')
      innerAudioContext.play();
      // innerAudioContext.onPlay(() => {
      //   console.log('语音播放')
      // });
    },
    onHide: function () {
      console.log('页面隐藏')
    },

    // 页面卸载时生命周期函数
    onUnload: async function () {
      var that = this;
      console.log('页面卸载，监听器关闭');
      if (msgWatcher) {
        await msgWatcher.close();
        console.log('XXX', msgWatcher)
      }
      innerAudioContext.stop();
      //离开页面时，在使用者的对应会话 数组元素 中 更新 离开时间
      // await wx.cloud.callFunction({
      //     name: 'chat',
      //     data: {
      //       type: 'leaveSession',
      //       sid: that.data.sid,
      //     }
      //   })
      //   .then((res) => {
      //     console.log('云函数leaveSession调用成功', res)
      //   })
    }
})