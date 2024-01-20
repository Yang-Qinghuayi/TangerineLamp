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
      "我感到比往常更加神经过敏和焦虑",
      "我无缘无故感到担心",
      "我容易心烦意乱或感到恐慌",
      "我感到我的身体好像被分成几块，支离破碎",
      "我感到事事都很顺利，不会有倒霉的事情发生",
      "我的四肢抖动和震颤",
      "我因头痛、颈痛、背痛而烦恼",
      "我感到无力且容易疲劳",
      "我感到很平静，能安静坐下来",
      "我感到我的心跳较快",
      "我因阵阵的眩晕而不舒服",
      "我有阵阵要昏倒的感觉",
      "我呼吸时进气和出气都不费力",
      "我的手指和脚趾感到麻木和刺痛",
      "我因胃痛和消化不良而苦恼",
      "我必须时常排尿",
      "我的手总是很温暖而干燥",
      "我觉得脸发烧发红",
      "我容易入睡，晚上休息很好",
      "我做恶梦"
    ]

  },

  //选择答案
  chooseAnswer(e) {
    const revNums = [5, 9, 13, 17, 19];
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
        let testName = "焦虑自评量表SDS";
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
    totalScores *= 1.25;                                //总分乘以1.25
    // 取整数
    totalScores = Math.round(totalScores);
    if (totalScores < 50) {
      final_eval_str = "恭喜，本次测评未发现焦虑症状！";
      totalColor = "green";
    } else if (totalScores >= 50 && totalScores <= 59) {
      final_eval_str = "有极轻微焦虑症状，可自行观察一段时间，或向心理医师寻求建议。";
      totalColor = "blue";
    } else if (totalScores >= 60 && totalScores <= 69) {
      final_eval_str = "有中度焦虑症状，可自行观察一段时间，或向心理医师寻求建议。";
      totalColor = "orange";
    } else {
      final_eval_str = "有较严重焦虑症状，请想办法向心理咨询师寻求帮助！";
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