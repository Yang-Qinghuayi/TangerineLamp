// miniprogram/pages/index1/test1/testlists/pcl-5/pcl-5.js
const db = wx.cloud.database();
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalScores: 0,
    totalColor: "",
    final_eval_str: "", // 最终测评结果字符串
    showCalculation: false,
    currentChosen: -1,
    nowIndex: 1,
    chosenAnswers: [0], //第0位仅用来占位，真正的index从1开始
    chosenAnswersLength: 0,  //已回答问题个数
    questions: [
      "",  //仅用来占位，nowIndex从1开始
      "我感到情绪沮丧，郁闷",
      "我感到早晨心情最好",
      "我要哭或想哭",
      "我夜间睡眠不好",
      "我吃饭像平常一样多 ",
      "我的性功能正常",
      "我感到体重减轻 ",
      "我为便秘烦恼",
      "我的心跳比平时快",
      "我无故感到疲乏",
      "我的头脑像平常一样清楚",
      "我做事情像平常一样不感到困难",
      "我坐卧难安，难以保持平静",
      "我对未来感到有希望",
      "我比平时更容易激怒",
      "我觉得决定什么事很容易",
      "我感到自己是有用的和不可缺少的人",
      "我的生活很有意思",
      "假若我死了，别人会过得更好",
      "我仍旧喜欢自己平时喜欢的东西"
    ]

  },

  //选择答案
  chooseAnswer(e) {
    const revNums = [2, 5, 6, 11, 12, 14, 16, 17, 18, 20];
    let currentChosen = e.currentTarget.dataset.index;

    let chosenAnswersLength = this.data.chosenAnswersLength;
    let nowIndex = this.data.nowIndex;
    let chosenAnswers = this.data.chosenAnswers;
    // 第几个问题，选择的答案
    if (revNums.includes(nowIndex)) {
      chosenAnswers[nowIndex] = 5 - currentChosen;
    } else

      chosenAnswers[nowIndex] = currentChosen;
    if (nowIndex === chosenAnswersLength + 1) chosenAnswersLength++;
    this.setData({
      currentChosen: currentChosen,
      chosenAnswers: chosenAnswers,
      chosenAnswersLength: chosenAnswersLength
    })
  },

  //点击回到上一题
  tapPrev() {
    let prevIndex = this.data.nowIndex - 1;
    let prevChoosen = this.data.chosenAnswers[prevIndex];
    this.setData({
      nowIndex: prevIndex,
      currentChosen: prevChoosen
    })
  },

  //点击下一题 or 提交--> 根据nowIndex判断是下一题还是查看结果分析
  tapNext() {
    if (this.data.currentChosen === -1) {   //未选择答案，驳回
      wx.showToast({
        title: '请选择一项',
        icon: 'none'
      })
    } else {
      if (this.data.nowIndex === 20) {     //当前index为最后一个题目，准备跳转到结果分析页面
        this.calculate();
        this.setData({
          showCalculation: true
        })
        // ↓ ********* 保存分析结果到数据库 ********* ↓
        let testName = "抑郁自评量表SDS";
        let totalScores = this.data.totalScores;
        let partScores = [];
        let advice = this.data.final_eval_str;
        let date = Date.now();
        let totalColor = this.data.totalColor;
        db.collection("index1_adviceResult").add({
          data: {
            testName: testName,
            totalScores: totalScores,
            partScores: partScores,
            advice: advice,
            date: date,
            totalColor: totalColor,
          }
        }).then(res => {
          console.log("测评结果添加入数据库")
        })

        // ↑ ********* 保存分析结果到数据库 ********* ↑

      } else {                           //当前index为中间题目,继续在本页面渲染
        //从未问答过下一题
        if (this.data.nowIndex >= this.data.chosenAnswersLength) {
          let nowIndex = this.data.nowIndex;
          this.setData({
            currentChosen: -1,
            nowIndex: nowIndex + 1,
          })
        } else {
          // //已经回答过下一题
          let nowIndex = this.data.nowIndex;
          let nextIndex = nowIndex + 1;
          let nextChosen = this.data.chosenAnswers[nextIndex];
          this.setData({
            currentChosen: nextChosen,
            nowIndex: nextIndex,
          })
        }
      }
    }
  },

  //计算得分
  calculate() {
    let totalScores = 0;
    let final_eval_str = "";
    let totalColor = "";
    for (var i = 1; i <= 20; i++) {                     //计算各部分得分
      totalScores += this.data.chosenAnswers[i];
    }
    let totalIndex = totalScores / 80;
    if (totalIndex < 0.5) {
      final_eval_str = "恭喜，本次测评未发现抑郁症状！";
      totalColor = "green";
    } else if (totalIndex >= 0.5 && totalIndex <= 0.59) {
      final_eval_str = "有极轻微抑郁症状，可自行观察一段时间，或向心理医师寻求建议。";
      totalColor = "blue";
    } else if (totalIndex >= 0.6 && totalIndex <= 0.69) {
      final_eval_str = "有中度抑郁症状，可自行观察一段时间，或向心理医师寻求建议。";
      totalColor = "orange";
    } else {
      final_eval_str = "有较严重抑郁症状，请想办法向心理咨询师寻求帮助！";
      totalColor = "red";
    }

    this.setData({
      totalScores,
      final_eval_str,
      totalColor
    })
  },

  navback() {
    wx.navigateBack({
      delta: 2,
    })
  },

})