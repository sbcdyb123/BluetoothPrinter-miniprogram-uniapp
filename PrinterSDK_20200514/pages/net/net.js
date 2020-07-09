// pages/sendCommand/sendCommand.js

/**
 * 此Demo仅供参考，可打印数字，英文，符号，中文，
 * 小程序支持的蓝牙为低功耗蓝牙（BLE），数据量大需分包发送
 */

var app = getApp();
var tsc = require("../../utils/tsc.js");
var esc = require("../../utils/esc.js");
var encode = require("../../utils/encoding.js");//GB18030

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ssid:"",
    password:"",
    looptime: 0,
    currentTime: 1,
    lastData: 0,
    oneTimeData: 60,
    returnResult: "",
    buffSize: [],
    buffIndex: 0,
    printNum: [],
    printerNum: 1,
    currentPrint: 1,
    netCommand: [31, 27,31, 27, 0, 17, 34, 80],
    selfCommand: [126, 87, 67],//斑马指令自检页
    end:[0],
    isNet:false,//标记是否为配网
    defaultType: true,
    passwordType: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.notifyServiceId,
      characteristicId: app.BLEInformation.notifyCharaterId,
      state: true,
      success: function (res) {
        wx.onBLECharacteristicValueChange(function (r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
        })
      },
      fail: function (e) {
        console.log(e)
      },
      complete: function (e) {
        console.log(e)
      }
    })
  },

   ssid: function (e) { //获取输入SSID
    this.setData({
      ssid: e.detail.value
    })
    //  console.log("字符长度：" + data.name.length)
  },
  clear:function(){//清空输入
    this.setData({
      ssid: ""
    })
  },
  password: function (e) { //获取输入password
    this.setData({
      password: e.detail.value
    })
  },
  //defaultType：眼睛状态   passwordType：密码可见与否状态
  eyeStatus: function () {
    if (this.data.defaultType) {
      this.setData({
        passwordType: false,
        defaultType: false,
      })
    } else {
      this.setData({
        passwordType: true,
        defaultType: true,
      })
    }
  },

  settiing: function () { //设置
    console.log("SSID长度：" + this.data.ssid.length)
    if (this.data.ssid.length == 0 ) {
      wx.showModal({
        title: '提示',
        content: '名称SSID不能为空！',
        showCancel: false,
      })
    }else {
    wx.setStorageSync("ssid", this.data.ssid)
    wx.setStorageSync("password", this.data.password)
    var t_ssid = "\"" + this.data.ssid +"\""
    var t_password = "\""+this.data.password + "\""
    this.setData({
      looptime: 0,
      isNet:true,
    })
    var SSID = new encode.TextEncoder(
      'utf-8', {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode(t_ssid);
    var PASSWORD = new encode.TextEncoder(
      'utf-8', {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode(t_password);
      var data = [];
      for (var i = 0; i < this.data.netCommand.length;i++){
        data.push(this.data.netCommand[i]);
     }
      for (var i = 0; i < SSID.length; i++) {
        data.push(SSID[i]);
      }
      data.push(0);
      for (var i = 0; i < PASSWORD.length; i++) {
        data.push(PASSWORD[i]);
      }
      data.push(0);
      this.prepareSend(data)
    }
  },
  receiptTest: function () { //打印自检页
    this.prepareSend(this.data.selfCommand)
  },

  prepareSend: function (buff) { //准备发送，根据每次发送字节数来处理分包数量
    console.log(buff)
    var that = this
    var time = that.data.oneTimeData
    var looptime = parseInt(buff.length / time);
    var lastData = parseInt(buff.length % time);
    console.log(looptime + "---" + lastData)
    that.setData({
      looptime: looptime + 1,
      lastData: lastData,
      currentTime: 1,
    })
    that.Send(buff)
  },

  Send: function (buff) { //分包发送
    var that = this
    var currentTime = that.data.currentTime
    var loopTime = that.data.looptime
    var lastData = that.data.lastData
    var onTimeData = that.data.oneTimeData
    var printNum = that.data.printerNum
    var currentPrint = that.data.currentPrint
    var buf
    var dataView
    if (currentTime < loopTime) {
      buf = new ArrayBuffer(onTimeData)
      dataView = new DataView(buf)
      for (var i = 0; i < onTimeData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    } else {
      buf = new ArrayBuffer(lastData)
      dataView = new DataView(buf)
      for (var i = 0; i < lastData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    }
    console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
    wx.writeBLECharacteristicValue({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.writeServiceId,
      characteristicId: app.BLEInformation.writeCharaterId,
      value: buf,
      success: function (res) {
        if(that.data.isNet){ 
          wx.showModal({
            title: '发送成功',
            content: '请耐心等待配网...\r\n配网成功打印：Config SUCCESS!\r\n配网失败打印：Config Fail!!!',
            showCancel: false,
            confirmText: '知道啦',
            success: function (res) {
              if (res.confirm) {
                that.setData({
                  isNet: false,
                })
                that.onShow();
              } else if (res.cancel) {
                console.log('用户点击关闭')
              }
            }
          })
          console.log("配网")
        }else{
          console.log("不配网")
        }
        console.log("发送成功")
        console.log(res)
      },
      fail: function (e) {
        console.log("发送失败")
        wx.showModal({
          title: '提示',
          content: '发送失败',
          showCancel: false
        })
        console.log(e)
        return;
      },
      complete: function () {
        currentTime++
        if (currentTime <= loopTime) {
          that.setData({
            currentTime: currentTime
          })
          that.Send(buff)
        } else {
         
          if (currentPrint == printNum) {
            that.setData({
              looptime: 0,
              lastData: 0,
              currentTime: 1,
              currentPrint: 1
            })
          } else {
            currentPrint++
            that.setData({
              currentPrint: currentPrint,
              currentTime: 1,
            })
            that.Send(buff)
          }
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var list = []
    var numList = []
    var j = 0
    for (var i = 60; i < 200; i += 10) {
      list[j] = i;
      j++
    }
    for (var i = 1; i < 10; i++) {
      numList[i - 1] = i
    }
    this.setData({
      buffSize: list,
      oneTimeData: list[0],
      printNum: numList,
      printerNum: numList[0]
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    //获取本地数据
    var ssid = wx.getStorageSync('ssid');
    var password = wx.getStorageSync('password');
    console.log("已保存"+ssid);
    console.log("已保存" + password);
    if (ssid) {
      this.setData({
         ssid: ssid 
         });
    }
    if (password) {
      this.setData({ 
        password: password
         });
    }
  },

  buffBindChange: function (res) { //更改打印字节数
    var index = res.detail.value
    var time = this.data.buffSize[index]
    console.log("index" + index);
    console.log("time" + time);
    this.setData({
      buffIndex: index,
      oneTimeData: time
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.closeBLEConnection({
    //   deviceId: app.BLEInformation.deviceId,
    //   success: function (res) {
    //     console.log("关闭蓝牙成功")
    //   },
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})