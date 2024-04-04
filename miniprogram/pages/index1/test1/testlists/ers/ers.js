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
      "我对朋友很慷慨",
      "我能很快摆脱惊吓，并从中恢复过来",
      "我乐于应付新的和非同寻常的局面",
      "我通常能给人们留下很好的印象",
      "我乐于去品尝没有吃过的食物",
      "我被认为是一个精力非常充沛的人",
      "我乐于选择不同的路径到达我熟悉的地方",
      "比起大多数人我更有好奇心",
      "我遇到的大多数人都很可爱",
      "行动之前我总是周密地考虑一些事情",
      "我喜欢做新奇和不同凡响的事情",
      "我的日常生活充满了很多让我感兴趣的事情",
      "我乐于把自己描述为个性很强的人",
      "我能很快并适时地从对某人的气恼中摆脱出来",
    ]

  },

  //选择答案
  chooseAnswer(e) {
    let currentChosen = e.currentTarget.dataset.index;
    let chosenAnswersLength = this.data.chosenAnswersLength;
    let nowIndex = this.data.nowIndex;
    let chosenAnswers = this.data.chosenAnswers;
    // 第几个问题，选择的答案
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
      if (this.data.nowIndex === 14) {     //当前index为最后一个题目，准备跳转到结果分析页面

        this.calculate();
        this.setData({
          showCalculation: true
        })
        // ↓ ********* 保存分析结果到数据库 ********* ↓
        let testName = "自我韧性量表ERS";
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
    for (var i = 1; i <= 14; i++) {                     //计算各部分得分
      totalScores += this.data.chosenAnswers[i];
    }
    if (totalScores <= 10) {
      final_eval_str = "哈喽，好像你很难从逆境或顺境中恢复常态，你可以从制定和完成小目标开始，慢慢建立自己的自信哦~愿你自信从容，充满力量！";
      totalColor = "orange";
    } else if (totalScores >= 11 && totalScores <= 22) {
      final_eval_str = "哈喽，好像你经常难以从逆境或顺境中恢复常态，是低心理弹性特质哦。你可以通过制定和完成小目标来增强自己的自信哟~愿你自信从容，充满力量！";
      totalColor = "orange";
    } else if (totalScores >= 23 && totalScores <= 34) {
      final_eval_str = "哈喽，好像你有时难以从逆境或顺境中恢复常态，是一般心理弹性特质哦。你可以多多锻炼自我的调控能力，让自己变得更自信哟！愿你自信从容，充满力量！";
      totalColor = "orange";
    } else if (totalScores >= 35 && totalScores <= 46) {
      final_eval_str = "哈喽，你有很棒的能力从逆境或顺境中恢复常态，是高心理弹性特质继续保持哟！";
      totalColor = "green";
    } else {
      final_eval_str = "哈喽，你的自我韧性水平超级棒，是非常高心理弹性特质，继续保持哟！";
      totalColor = "green";
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