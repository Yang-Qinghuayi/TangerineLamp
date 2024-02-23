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
    preNickName: "",
    preAvatarUrl: "",
  },
  onLoad: function (options) {
    this.setUser();
  },

  setUser() {
    console.log("kiss");
    db.collection("user")
      .where({
        _openid: app.globalData.openid,
      })
      .then((res) => {
        if (!res) {
          db.collection("user")
            .add({
              data: {
                avatarUrl: app.globalData.userInfo.avatarUrl,
                nickName: app.globalData.userInfo.nickName,
              },
            })
            .then((res) => {
              this.getUser();
            });
        } else {
          this.getUser();
        }
      });
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
          preNickName: res.data[0].nickName,
          preAvatarUrl: res.data[0].avatarUrl,
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
        that.setData({
          avatarUrl: res.tempFilePaths[0],
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
    const uploadPromise = new Promise((resolve, reject) => {
      const fileName = `userPic/${that.generateUUID()}.png`; // 生成文件名
      let imgPath = that.data.avatarUrl;
      if (imgPath === that.data.preAvatarUrl) {
        // 说明用户没有修改头像
        db.collection("user")
          .where({
            _openid: app.globalData.openid,
          })
          .update({
            data: {
              nickName: that.data.nickName,
              avatarUrl: that.data.avatarUrl,
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
      } else {
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: imgPath,
          success: (res) => {
            console.log("上传成功: ", res);
            that.setData({
              avatarUrl: res.fileID,
            });
            db.collection("user")
              .where({
                _openid: app.globalData.openid,
              })
              .update({
                data: {
                  nickName: that.data.nickName,
                  avatarUrl: that.data.avatarUrl,
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
      }
    });

    uploadPromise
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

  updateUser() {
    console.log("zhengzai 更新用户信息");
  },

  // 展示提交窗口
  showPopup() {
    this.uploadImages();
  },
});
