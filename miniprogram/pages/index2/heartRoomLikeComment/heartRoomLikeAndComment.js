// pages/index2/heartRoomLikeComment/heartRommLikeAndComment.js
const app = getApp()
const db = wx.cloud.database()
// 补零函数
function padZero(num) {
  return num < 10 ? '0' + num : num;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    mybasicdata:"",
    isLike: false,
    likenum:0,
    opendid:"",
    comment:"",
    showCustomToast:false,
    isRefreshing: false,
    commentList:[],
    commentnum:0
  },
  // 点击查看图片
  viewImage: function(e) {
      const src = e.currentTarget.dataset.src; // 假设你已经将图片的 URL 作为 data-src 设置到了 image 标签中
      wx.previewImage({
        urls: [src], // 需要预览的图片 HTTP 链接列表
      });
    },
  // 更新 comment 的值
  bindInput: function(e) {
    this.setData({
      comment: e.detail.value
    });
  },
  // 显示自定义弹窗
  showCustomToast:function() {
    const that = this
    that.setData({ showCustomToast: true });
    setTimeout(() => {
      that.setData({ showCustomToast: false });
    }, 2000); // 2秒后隐藏
  },
  // 发送评论
  sendComment:function(){
    if(this.data.comment.length==0){
      this.showCustomToast()
    }else{
      let that = this
      let userInfo = wx.getStorageSync("userInfo");
      // 获取当前时间
      let now = new Date();
      // 格式化时间
      let year = now.getFullYear(); // 年份
      let month = now.getMonth() + 1; // 月份，getMonth() 返回的月份是从0开始的，所以需要加1
      let date = now.getDate(); // 日期
      let hours = now.getHours(); // 小时
      let minutes = now.getMinutes(); // 分钟
      let seconds = now.getSeconds(); // 秒钟
      let formattedTime = `${year}-${padZero(month)}-${padZero(date)} ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
      db.collection('index2HeartRoom_comment').add({
        data: {
            id: this.data.id,// 被评论动态的id
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            time:formattedTime.toString(),
            comment:this.data.comment
        },
        success: function(dbRes) {
            console.log("评论成功：", dbRes);
            that.setData({
              comment:""
            })
            that.getComment()
        },
        fail: function(err) {
            console.log("评论失败：", err);
        },
    });
    }
  },
  // 删除评论（这里我们规定只有帖主可以删除评论）
  // 删除数据
  delete:function(e){
    let that = this
    let temp = e.currentTarget.dataset.id
    console.log("删除",temp)
    db.collection('index2HeartRoom_comment').where({
      _id:temp
    }).remove({
      success: function(res){
        console.log('删除成功', res)
        that.getComment()
      },
      fail: function(err) {
        console.error('删除失败', err);
      }
    })
  },
  // 获取基础数据（不包括点赞与评论）
  getbasicData: function(){
    let that = this
    db.collection('index2HeartRoom_textAndpicture')
        .where({
          _id: this.data.id
        })
        .get({
          success: function(res) {
            console.log("查询成功", res);
            that.setData({
              mybasicdata: res.data[0]
            });
          },
          fail: function(err) {
            console.log('查询失败', err);
          }
        });
  },
  // 获取点赞数据
  getLike: function(){
    let that = this
    db.collection('index2HeartRoom_like')
        .where({
          id: that.data.id
        })
        .get({
          success: function(res) {
            console.log("点赞查询成功", res);
            that.setData({
              likenum: res.data.length
            });
            let isLike = res.data.some(rec => rec._openid == that.data.openid);
            that.setData({
               isLike: isLike
            });
          },
          fail: function(err) {
            console.log('点赞查询失败', err);
          }
        });
  },
  // 点赞点击响应事件
  Like: function() {
    let that=this
    if(this.data.isLike){// 用户取消点赞，删除点赞记录
      db.collection('index2HeartRoom_like').where({
        _openid: this.data.openid,
      }).remove({
        success: function(res) {
          console.log('点赞删除成功');
          that.getLike()
        },
        fail: function(err) {
          console.error('点赞删除失败',err);
        }
      });
    }else{ //用户点赞，新增点赞记录
      db.collection('index2HeartRoom_like').add({
        data: {
            id: that.data.id
        },
        success: function(dbRes) {
            console.log("点赞存入成功：", dbRes);
            that.getLike()
        },
        fail: function(err) {
            console.log("点赞存入失败：", err);
        },
    });
    }
  },
  // 获取评论数据
  getComment: function(){
    let that = this
    return new Promise((resolve, reject) => {
    db.collection('index2HeartRoom_comment')
        .where({
          id: that.data.id
        })
        .get({
          success: function(res) {
            console.log("评论查询成功", res);
            that.setData({
              commentnum: res.data.length,
              commentList: res.data
            });
            resolve(res.data); // 解析 Promise
          },
          fail: function(err) {
            console.log('评论查询失败', err);
            reject(err); // 拒绝 Promise
          }
        });
      });
  },
  // 下拉刷新评论数据
  // 下拉刷新数据
  onRefresh: function() {
    // 用户触发了下拉刷新操作
    console.log('开始刷新数据');
    this.setData({
      isRefreshing:true
    })
    this.getComment().then(() => {
      // 数据获取完成后
      this.setData({
        isRefreshing: false // 停止刷新状态
      });
    console.log('结束刷新数据');
    }).catch((err) => {
      // 处理错误情况
      console.error(err);
    });    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let temp = options.id + ""
    this.setData({
      id:temp,
      isLike: false,
      openid:wx.getStorageSync("openid")
    })
    this.getbasicData()
    this.getLike()
    this.getComment()
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
    this.getbasicData()
    this.getLike()
    this.getComment()
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