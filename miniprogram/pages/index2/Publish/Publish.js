// pages/index2/Publish/Publish.js
const app = getApp();
const db = wx.cloud.database();
const defaultImg =
  "cloud://kiss-2g4jze0q248cf98b.6b69-kiss-2g4jze0q248cf98b-1304921980/heartRecPic/logo.png";
let defaultImagePath = [];
let isNone = "0";
// 补零函数
function padZero(num) {
  return num < 10 ? "0" + num : num;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showCustomToast: false,
    area: "",
    text: "",
    imageList: [], // 存储图片的临时路径
    isPrivate: false, // 默认不私秘
    isComment: true, //默认允许评论
    isSubmit: true, //默认投稿
    nickName: "",
    avatarUrl: "",
  },

  getNickNameAndAvatarUrl: function () {
    console.log("获取用户信息");
    // 从数据库'user'中获取用户信息
    return db
      .collection("user")
      .where({
        _openid: app.globalData.openid,
      })
      .get({
        success: (res) => {
          console.log("获取用户信息成功", res);
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
          });
        },
        fail: (res) => {
          console.log("获取用户信息失败", res);
        },
      });
  },
  // 显示自定义弹窗1
  showCustomToast1: function () {
    const that = this;
    that.setData({ showCustomToast1: true });
    setTimeout(() => {
      that.setData({ showCustomToast1: false });
      // 弹窗结束后的页面跳转
      wx.navigateBack({
        delta: 1, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
      });
    }, 2000); // 2秒后隐藏
  },
  // 显示自定义弹窗1
  showCustomToast2: function () {
    const that = this;
    that.setData({ showCustomToast2: true });
    setTimeout(() => {
      that.setData({ showCustomToast2: false });
    }, 2000); // 2秒后隐藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    console.log("laoluo");
    this.getNickNameAndAvatarUrl();
    // console.log("openid", app.globalData.openid);
    isNone = "0";
    // 将默认图片的fileID转换为临时路径
    defaultImagePath = [defaultImg];
    let promises = defaultImagePath.map((fileID) => {
      return wx.cloud.downloadFile({
        fileID: fileID,
      });
    });
    // 等待转换完成
    Promise.all(promises)
      .then((results) => {
        // results 是一个包含临时文件路径的数组
        let tempFilePaths = results.map((result) => result.tempFilePath);
        console.log("转换完成：", tempFilePaths); // 这里是图片的临时路径
        defaultImagePath = tempFilePaths;
      })
      .catch((error) => {
        console.error("转换出错", error);
      });
    console.log(options);
    let Temp = options.Area + "";
    this.setData({
      area: Temp,
    });
  },
  //取消编辑
  cancel: function () {
    wx.navigateBack({
      delta: 1, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
    });
  },
  //保存编辑
  publish: function () {
    if (this.data.text.length == 0 && this.data.imageList.length == 0) {
      this.showCustomToast2();
    } else {
      //上传图片且保存文本
      this.uploadImages();
    }
  },
  // 更新 textarea 的值
  bindInput: function (e) {
    this.setData({
      text: e.detail.value,
    });
  },
  // 点击图片上传，进行图片选择
  selectpic: function () {
    const that = this;
    wx.chooseImage({
      count: 50, // 允许选择的图片数量
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          imageList: that.data.imageList.concat(tempFilePaths),
        });
        console.log("选择图片后的路径：", that.data.imageList);
      },
    });
  },
  // 删除(预览中)已上传图片
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index;
    let imageList = this.data.imageList;
    imageList.splice(index, 1); // 删除指定索引的图片
    this.setData({ imageList });
  },
  //为上传的每张图片生成唯一资源标识符UUID
  generateUUID: function () {
    const timestamp = Date.now().toString(36); // 将当前时间戳转换为基数为36的字符串
    const randomSection = Math.random().toString(36).substring(2, 15); // 生成一个随机字符串
    return `${timestamp}-${randomSection}`;
  },
  checkboxChange1: function (e) {
    let temp = this.data.isPrivate;
    temp = !temp;
    this.setData({
      isPrivate: temp,
    });
  },
  checkboxChange2: function (e) {
    let temp = this.data.isComment;
    temp = !temp;
    this.setData({
      isComment: temp,
    });
  },
  checkboxChange3: function (e) {
    let temp = this.data.isSubmit;
    temp = !temp;
    this.setData({
      isSubmit: temp,
    });
  },
  // 上传图片及评论
  uploadImages: function () {
    const that = this;
    // 获取当前设备时间并组合成 yyyy-MM-dd HH:mm:ss 格式
    // 获取当前时间
    let now = new Date();
    // 格式化时间
    let year = now.getFullYear(); // 年份
    let month = now.getMonth() + 1;
    let date = now.getDate(); // 日期
    let hours = now.getHours(); // 小时
    let minutes = now.getMinutes(); // 分钟
    let seconds = now.getSeconds(); // 秒钟
    let formattedTime = `${year}-${padZero(month)}-${padZero(date)} ${padZero(
      hours
    )}:${padZero(minutes)}:${padZero(seconds)}`;
    console.log(formattedTime.toString()); // 打印当前的格式化时间
    let openid = wx.getStorageSync("openid");
    // let userInfo = wx.getStorageSync("userInfo");

    // 单独处理用户不上传图片的情况
    let tempImageList = that.data.imageList;
    if (that.data.imageList.length == 0) {
      console.log("空的");
      tempImageList = defaultImagePath;
      isNone = "1";
    }
    let tempPicID = [];
    // 将上传操作封装在 Promise 中
    let uploadPromises = tempImageList.map((imgPath) => {
      return new Promise((resolve, reject) => {
        const fileName = `heartRoomPic/${that.generateUUID()}.png`; // 生成文件名
        // console.log("即将上传的:", imgPath);
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: imgPath,
          success: (res) => {
            // console.log("上传成功: ", res);
            tempPicID.push(res.fileID);
            resolve(res.fileID);
          },
          fail: (err) => {
            console.log("上传失败: ", err);
            reject(err);
          },
        });
      });
    });
    uploadPromises.push(that.getNickNameAndAvatarUrl());
    Promise.all(uploadPromises)
      .then((results) => {
        console.log("所有图片上传操作已完成");
        db.collection("index2HeartRoom_textAndpicture").add({
          data: {
            time: formattedTime.toString(),
            area: that.data.area,
            text: that.data.text,
            nickname: that.data.nickName,
            avatar: that.data.avatarUrl,
            picID: tempPicID,
            isNone: isNone,
            isPrivate: that.data.isPrivate,
            isComment: that.data.isComment,
            isSubmit: that.data.isSubmit,
          },
          success: function (dbRes) {
            console.log("数据库存入成功：", dbRes);
            that.showCustomToast1();
          },
          fail: function (err) {
            console.log("数据库存入失败：", err);
          },
        });
      })
      .catch((error) => {
        console.error("在上传过程中发生错误：", error);
        // 出错时显示提示框
        wx.showToast({
          title: "操作失败",
          icon: "none",
          duration: 2000,
        });
      });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
