const db = wx.cloud.database();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: "微信用户",
    avatarUrl:
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    imageList: [],
    defaultImagePath: [
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    ],
  },
  onLoad: function (options) {
    this.getUser();
  },

  getUser() {
    db.collection("user")
      .where({
        _openid: app.globalData.openid,
      })
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({
          avatarUrl: res.data[0].avatarUrl,
          nickName: res.data[0].nickName,
        });
      });
  },

  handleInput(e) {
    this.setData({
      nickName: e.detail.value,
    });
  },
  selectpic: function () {
    const that = this;
    wx.chooseImage({
      count: 1, // 允许选择的图片数量
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          imageList: tempFilePaths,
          avatarUrl: tempFilePaths[0],
        });
      },
    });
  },
  generateUUID: function () {
    const timestamp = Date.now().toString(36); // 将当前时间戳转换为基数为36的字符串
    const randomSection = Math.random().toString(36).substring(2, 15); // 生成一个随机字符串
    return `${timestamp}-${randomSection}`;
  },
  // 上传图片
  uploadImages: function () {
    const that = this;
    let openid = app.globalData.openid;

    // 保存前先删除已有记录
    db.collection("user")
      .where({
        _openid: openid,
      })
      .remove({
        success: function (res) {
          console.log("成功删除记录数", res.stats.removed);
          let tempImageList = that.data.imageList;
          if (that.data.imageList.length == 0) {
            console.log("空的");
            tempImageList = this.data.defaultImagePath;
          }
          const uploadPromises = tempImageList.map((imgPath) => {
            return new Promise((resolve, reject) => {
              const fileName = `userPic/${that.generateUUID()}.png`; // 生成文件名
              console.log("即将上传的:", imgPath);
              wx.cloud.uploadFile({
                cloudPath: fileName,
                filePath: imgPath,
                success: (res) => {
                  console.log("上传成功: ", res);
                  db.collection("user").add({
                    data: {
                      nickName: that.data.nickName,
                      avatarUrl: res.fileID,
                    },
                    success: function (dbRes) {
                      console.log("数据库存入成功：", dbRes);
                      resolve(dbRes);
                    },
                    fail: function (err) {
                      console.log("数据库存入失败：", err);
                      reject(err);
                    },
                  });
                },
                fail: (err) => {
                  console.log("上传失败: ", err);
                  reject(err);
                },
              });
            });
          });

          Promise.all(uploadPromises)
            .then((results) => {
              console.log("所有图片上传和数据库操作已完成");
              wx.showToast({
                title: "提交成功",
                duration: 1500,
                mask: true,
              });
            })
            .catch((error) => {
              console.error("在上传过程中发生错误：", error);

              wx.showToast({
                title: "操作失败",
                icon: "none",
                duration: 2000,
              });
            });
        },
        fail: function (err) {
          console.error("删除失败", err);
        },
      });
  },

  // 展示提交窗口
  showPopup() {
    this.uploadImages();
  },
});
