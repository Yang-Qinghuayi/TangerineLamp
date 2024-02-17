const app = getApp()
const db = wx.cloud.database();
const defaultImg = "cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/heartRecPic/logo.png"
let defaultImagePath = []
let isNone = "0"
// pages/index2/heartRecDetail/heartRecDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCustomToast: false,
    cur_year:'',
    cur_month_date:'',
    cur_question:"",
    cur_answer:"",
    imageList: []  // 存储图片的临时路径
  },
  // 显示自定义弹窗
  showCustomToast:function() {
    const that = this
    that.setData({ showCustomToast: true });
    setTimeout(() => {
      that.setData({ showCustomToast: false });
      // 弹窗结束后的页面跳转
      wx.navigateBack({
        delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
      });
    }, 2000); // 2秒后隐藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 将默认图片的fileID转换为临时路径
    defaultImagePath = [defaultImg]
    let promises = defaultImagePath.map(fileID => {
      return wx.cloud.downloadFile({
          fileID: fileID
      })
    });
    // 等待转换完成
    Promise.all(promises).then(results => {
    // results 是一个包含临时文件路径的数组
      let tempFilePaths = results.map(result => result.tempFilePath);
        console.log("转换完成：",tempFilePaths); // 这里是图片的临时路径
        defaultImagePath = tempFilePaths
    }).catch(error => {
        console.error("转换出错", error);
    });
    const that = this;
    console.log("来了: ",options)
    this.setData({
      cur_year : options.date.substring(0,4).toString(),
      cur_month_date: options.date.substring(5).toString()
    })
    this.getQuestion()
    let openid = app.globalData.openid
    // 使用正则表达式匹配月份和日期
    let dateStr = this.data.cur_month_date;
    let matches = dateStr.match(/(\d+)月(\d+)日/);
    db.collection('index2HeartRec_commentAndpicture').where({
      _openid: openid,
      year: this.data.cur_year,
      month: matches[1],
      day: matches[2]
    }).field({
      picID: true,
      comment: true,
      isNone: true
    }).limit(100) // 限制返回结果数量
    .get({
      success: function(res) {
        console.log('查询结果', res.data);
       // 获取评论
       that.setData({
         cur_answer: res.data[0].comment
       })
       // 获取图片(注意去掉默认图片)
       let fileIDs = res.data.map(item => item.picID); // 将 fileID 提取出来
       console.log('fileIDs', fileIDs); // 打印包含所有 picID 的数组
       if(res.data[0].isNone == "1"){
         console.log("没有")
         fileIDs = []
       }
       // 将每个 fileID 转换为临时路径
       let promises = fileIDs.map(fileID => {
         return wx.cloud.downloadFile({
          fileID: fileID
         })
       });
       // 等待所有的转换完成
       Promise.all(promises).then(results => {
        // results 是一个包含临时文件路径的数组
        let tempFilePaths = results.map(result => result.tempFilePath);
        console.log(tempFilePaths); // 这里是所有图片的临时路径
        that.setData({
          imageList: tempFilePaths
        })
       }).catch(error => {
        console.error("转换出错", error);
       });
      },
      fail: function(err) {
        console.error('查询失败', err);
      }
    });
  },
  // 获取当日问题
  getQuestion:function(){
    const that = this
    // 使用正则表达式匹配月份和日期
    let dateStr = this.data.cur_month_date;
    let matches = dateStr.match(/(\d+)月(\d+)日/);
    console.log("日期：",matches[2])
    db.collection('index2HeartRec_question').where({
      day: matches[2]
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
  //取消编辑
  cancel:function(){
    wx.navigateBack({
      delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
    });
  },
  //保存编辑
  save:function(){
    //上传图片且保存文本
    this.uploadImages()
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
  //为上传的每张图片生成唯一资源标识符UUID
  generateUUID:function() {
    const timestamp = Date.now().toString(36); // 将当前时间戳转换为基数为36的字符串
    const randomSection = Math.random().toString(36).substring(2, 15); // 生成一个随机字符串
    return `${timestamp}-${randomSection}`;
  },
  // 上传图片及评论
  uploadImages: function() {
    const that = this
    let openid = app.globalData.openid
    // 使用正则表达式匹配月份和日期
    let dateStr = this.data.cur_month_date;
    let matches = dateStr.match(/(\d+)月(\d+)日/);
    // 保存前先删除已有记录
    db.collection('index2HeartRec_commentAndpicture').where({
      _openid: openid,
      year: this.data.cur_year,
      month: matches[1],
      day: matches[2]
    }).remove({
      success: function(res) {
        console.log('成功删除记录数', res.stats.removed);
        // 单独处理用户不上传图片的情况
        let tempImageList = that.data.imageList
        if(that.data.imageList.length==0) {
          console.log("空的")
          tempImageList=defaultImagePath
          isNone = "1"
        }
        // 将上传操作封装在 Promise 中
        const uploadPromises = tempImageList.map(imgPath => {
        return new Promise((resolve, reject) => {
        const fileName = `heartRecPic/${that.generateUUID()}.png`; // 生成文件名
        console.log("即将上传的:",imgPath)
        wx.cloud.uploadFile({
           cloudPath: fileName,
           filePath: imgPath,
           success: res => {
              console.log("上传成功: ", res);
              db.collection('index2HeartRec_commentAndpicture').add({
                  data: {
                      year: that.data.cur_year,
                      month: matches[1],
                      day: matches[2],
                      comment: that.data.cur_answer,
                      picID: res.fileID,
                      isNone: isNone
                  },
                  success: function(dbRes) {
                      console.log("数据库存入成功：", dbRes);
                      resolve(dbRes);
                  },
                  fail: function(err) {
                      console.log("数据库存入失败：", err);
                      reject(err);
                  },
              });
          },
          fail: err => {
              console.log("上传失败: ", err);
              reject(err);
          }
        });
      });
    });

    Promise.all(uploadPromises).then((results) => {
      console.log("所有图片上传和数据库操作已完成");
      // setTimeout(() => {
      //   // 弹窗结束后的页面跳转
      //   wx.navigateBack({
      //     delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
      //   })
      // }, 2000); // 弹窗显示2秒后执行跳转
      // 操作完成后显示提示框
      // wx.showToast({
      //     title: '保存成功',
      //     icon: 'success',
      //     duration: 2000 // 提示框显示时长为2000毫秒，即2秒
      // });
      that.showCustomToast();
    }).catch((error) => {
      console.error("在上传过程中发生错误：", error);
      // 出错时显示提示框
      wx.showToast({
          title: '操作失败',
          icon: 'none',
          duration: 2000
      });
     });

        // that.data.imageList.forEach((imgPath) => {
        //   const fileName = `heartRecPic/${that.generateUUID()}.png`;// 生成文件名
        //   wx.cloud.uploadFile({
        //     cloudPath: fileName,
        //     filePath: imgPath,
        //     success: res => {
        //       console.log("上传成功: ",res)
        //       db.collection('index2HeartRec_commentAndpicture').add({
        //         data: {
        //           year: that.data.cur_year,
        //           month: matches[1],
        //           day: matches[2],
        //           comment: that.data.cur_answer,
        //           picID: res.fileID
        //         },
        //         success: function(res) {
        //           console.log("数据库存入成功：",res)
        //         },
        //         fail: function(err) {
        //           console.log("数据库存入失败：",err)
        //         },
        //       });
        //     },
        //     fail: err => {
        //       console.log("上传失败: ",err)
        //     }
        //   })
        //   // wx.compressImage({
        //   //   src: imgPath, // 图片路径
        //   //   quality: 75, // 压缩质量
        //   //   success(res) {
        //   //     // 读取图片文件为二进制数据
        //   //     wx.getFileSystemManager().readFile({
        //   //       filePath: res.tempFilePath,
        //   //       success: buffer => {
        //   //     // 调用云函数
        //   //       wx.cloud.callFunction({
        //   //         name: 'picSave', // 云函数名称
        //   //         data: {
        //   //          fileContent: buffer.data
        //   //         },
        //   //       success: res => {
        //   //         console.log('上传成功', res.result);
        //   //       },
        //   //       fail: err => {
        //   //         console.error('上传失败', err);
        //   //       }
        //   //     });
        //   //    },
        //   //       fail: console.error
        //   //    });
        //   //   }
        //   // })
        // });
      },
      fail: function(err) {
        console.error('删除失败', err);
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
    isNone = "0"
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