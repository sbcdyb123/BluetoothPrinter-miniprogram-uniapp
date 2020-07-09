
var app = getApp();
var esc = require("../../utils/esc.js");
var encode = require("../../utils/encoding.js");

function convertToGrayscale(data) {
  let g = 0
  for (let i = 0; i < data.length; i += 4) {
    g = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11)
    data[i] = g
    data[i + 1] = g
    data[i + 2] = g
  }
  return data
}

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    looptime: 0,
    currentTime: 1,
    lastData: 0,
    oneTimeData: 0,
    returnResult: "",
    buffSize: [],
    buffIndex: 0,//发送字节数下标
    printNum: [],
    printNumIndex: 0,
    printerNum: 1,
    currentPrint: 1,
    isReceiptSend: false,
    isCheckTake:false,
    isQuery:false,
    chs: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that = this;
    // wx.notifyBLECharacteristicValueChange({
    //   deviceId: app.BLEInformation.deviceId,
    //   serviceId: app.BLEInformation.notifyServiceId,
    //   characteristicId: app.BLEInformation.notifyCharaterId,
    //   state: true,
    //   success: function (res) {
    //     wx.onBLECharacteristicValueChange(function (r) {
    //       console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
    //     })
    //   },
    //   fail: function (e) {
    //     console.log(e)
    //   },
    //   complete: function (e) {
    //     console.log(e)
    //   }
    // })
  },
  receiptTest: function () { //票据测试
    var that = this;
    var command = esc.jpPrinter.createNew()
    command.init()//初始化打印机
    command.setLeftMargin(0)//设置左边距
    command.setPrint()
    command.setPrintMode(41)
    command.setText("    71106 29079 81101 66268")
    command.setPrint()
    command.setPrintMode(0)
    command.setText("测试票，机号：44010660 2007.09.07-10：43：32")
    command.setPrint()
    command.setPrintMode(0)
    command.setText("双色球(B001)/2007105(0623)期 序号：00067：单式")
    command.setPrint()
    command.setPrint()
    command.setPrintMode(0)
    command.setText("1> ")
    command.setPrintMode(41)
    command.setText("03 04 13 18 19 27 - 13* 001")
    command.setPrint()
    command.setPrintMode(0)
    command.setText("2> ")
    command.setPrintMode(41)
    command.setText("01 04 17 18 19 28 - 01* 001")
    command.setPrint()
    command.setPrintMode(0)
    command.setText("3> ")
    command.setPrintMode(41)
    command.setText("01 04 17 18 19 28 - 01* 001")
    command.setPrint()
    command.setPrintMode(41)
    command.setText("    CD33 7B07 5F 8D D2C2")
    command.setPrint()
    command.setPrintMode(0)
    command.setText("开奖日:2007-09-09       金额20元")
    command.setPrint()
    command.setText("站地址：好易内部测试")
    command.setPrint()
    command.setText("查询电话：16880345 客服电话：020-88320568")
    command.setPrint()
    command.setText("兑奖通知:中奖10000元以内（含10000元）由银行自动返奖；10000元以上持本票到广州市福利彩票发行中心领奖。（此票不能在电脑福利彩票投注站兑奖）")
    // command.setAbsolutePrintPosition(18)
    command.setPrint()
    command.setHRIPosition(0)//设置HRI位置
    command.setHRIFont(0)//HRI字体大小
    command.setBarcodeHeight(60)//条码高度
    command.setBarcodeWidth(2)//设置条码宽度
    command.setAbsolutePrintPosition(24)
    command.setCode128("{A71106290798110166238");//code128  A类型
    command.setText("                                 888888888888")
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setBlackMarkStart()
    command.setCut()
    that.prepareSend(command.getData())//准备发送数据
  },

  prepareSend: function (buff) { //准备发送，根据每次发送字节数来处理分包数量
    //console.log(buff)
    var that = this
    var time = that.data.oneTimeData
    var looptime = parseInt(buff.length / time);
    var lastData = parseInt(buff.length % time);
    //console.log(looptime + "---" + lastData)
    that.setData({
      looptime: looptime + 1,
      lastData: lastData,
      currentTime: 1,
    })
    that.Send(buff)
  },
  queryStatus:function(){//查询打印机状态
    var that = this
    var buf;
    var dateView;
    /*
    n = 1：传送打印机状态
    n = 2：传送脱机状态
    n = 3：传送错误状态
    n = 4：传送纸传感器状态
    */
    buf = new ArrayBuffer(3)
    dateView = new DataView(buf)
    dateView.setUint8(0, 16)
    dateView.setUint8(1, 4)
    dateView.setUint8(2, 2)
    wx.writeBLECharacteristicValue({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.writeServiceId,
      characteristicId: app.BLEInformation.writeCharaterId,
      value: buf,
      success: function (res) {
        console.log("发送成功")
        that.setData({
          isQuery: true
        })
      },
      fail: function (e) {
        wx.showToast({
          title: '发送失败',
          icon: 'none',
        })
        //console.log(e)
        return;
      },
      complete: function () {

      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.notifyServiceId,
      characteristicId: app.BLEInformation.notifyCharaterId,
      state: true,
      success: function (res) {
        wx.onBLECharacteristicValueChange(function (r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
          var result = ab2hex(r.value)
          console.log("返回" + result)
          var tip = ''
          if (result == 12) {//正常
            tip = "正常"
          } else if (result == 32) {//缺纸
            tip = "缺纸"
          } else if (result == 36) {//开盖、缺纸
            tip = "开盖、缺纸"
          } else if (result == 16) {
            tip = "开盖"
          } else if (result == 40) {//其他错误
            tip = "其他错误"
          } else {//未处理错误
            tip = "未知错误"
          }
          wx.showModal({
            title: '打印机状态',
            content: tip,
            showCancel: false
          })

        })
      },
      fail: function (e) {
        wx.showModal({
          title: '打印机状态',
          content: '获取失败',
          showCancel: false
        })
        console.log(e)
      },
      complete: function (e) {
        that.setData({
          isQuery: false
        })
        console.log("执行完成")
      }
    })
  },
  checkTake: function () { //查询纸张状态
    var that = this
    var buf;
    var dateView;
      /*
      n = 1：传送打印机状态
      n = 2：传送脱机状态
      n = 3：传送错误状态
      n = 4：传送纸传感器状态
      */
      buf = new ArrayBuffer(3)
      dateView = new DataView(buf)
      dateView.setUint8(0, 16)
      dateView.setUint8(1, 4)
      dateView.setUint8(2, 4)
      wx.writeBLECharacteristicValue({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.writeServiceId,
      characteristicId: app.BLEInformation.writeCharaterId,
      value: buf,
      success: function (res) {
        console.log("发送成功")
        that.setData({
          isCheckTake: true
        })
      },
      fail: function (e) {
        wx.showToast({
          title: '发送失败',
          icon: 'none',
        })
        //console.log(e)
        return;
      },
      complete: function () {
     
      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.notifyServiceId,
      characteristicId: app.BLEInformation.notifyCharaterId,
      state: true,
      success: function (res) {
        wx.onBLECharacteristicValueChange(function (r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
          var result = ab2hex(r.value)
          console.log("返回"+result)
          var tip = ''
        if (result == 12) {//纸张已取走
          tip = "已取走"
        } else if (result == 10) {//纸张未取走
          tip = "未取走"
        }else{//未处理错误
          tip = "未知"
        }
        wx.showModal({
          title: '彩票是否取走？',
          content: tip,
          showCancel: false
        })
    
        })
      },
      fail: function (e) {
        wx.showModal({
          title: '彩票是否取走？',
          content: '获取失败',
          showCancel: false
        })
        console.log(e)
      },
      complete: function (e) {
        that.setData({
          isCheckTake: false
        })
        console.log("执行完成")
      }
    })


    // 操作之前先监听，保证第一时间获取数据
    // wx.onBLECharacteristicValueChange((characteristic) => {
    //   const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
    //   const data = {}
    //   if (idx === -1) {
    //     var result = ab2hex(characteristic.value)
    //     data[`chs[${this.data.chs.length}]`] = {
    //       uuid: characteristic.characteristicId,
    //       // value: ab2hex(characteristic.value)
    //       value: result
    //     }
    //     console.log("获取失败")
    //     wx.showModal({
    //       title: '提示',
    //       content: '获取状态失败',
    //       showCancel: false
    //     })
    //     that.setData({
    //       isQuery: false
    //     })
    //   } else {
    //     var result = ab2hex(characteristic.value)
    //     data[`chs[${idx}]`] = {
    //       uuid: characteristic.characteristicId,
    //       value: ab2hex(characteristic.value)
    //     }
    //     var tip = ''
    //     if (result == 12) {//正常
    //       tip = "正常"
    //     } else if (result == 36) {//缺纸
    //       tip = "缺纸"
    //     } else if (result == 16) {//开盖
    //       tip = "开盖"
    //     } else if (result == 40) {//其他错误
    //       tip = "其他错误"
    //     }else{//未处理错误
    //       tip = "未知错误"
    //     }
    //     wx.showModal({
    //       title: '提示',
    //       content: tip,
    //       showCancel: false
    //     })
    //     that.setData({
    //       isQuery: false
    //     })
    //   }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
    //   this.setData(data)
    // })
   
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
    //console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
    wx.writeBLECharacteristicValue({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.writeServiceId,
      characteristicId: app.BLEInformation.writeCharaterId,
      value: buf,
      success: function (res) {
        if (currentPrint == printNum) {
        wx.showToast({
          title: '已打印第' + currentPrint + '张成功',
        })
        }
        //console.log(res)
      },
      fail: function (e) {
        wx.showToast({
          title: '打印第' + currentPrint + '张失败',
          icon: 'none',
        })
        //console.log(e)
      },
      complete: function () {
        currentTime++
        if (currentTime <= loopTime) {
          that.setData({
            currentTime: currentTime
          })
          that.Send(buff)
        } else {
          // wx.showToast({
          //   title: '已打印第' + currentPrint + '张',
          // })
          if (currentPrint == printNum) {
            that.setData({
              looptime: 0,
              lastData: 0,
              currentTime: 1,
              isReceiptSend: false,
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
    for (var i = 20; i < 200; i += 10) {
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

  },


  buffBindChange: function (res) { //更改打印字节数
    var index = res.detail.value
    var time = this.data.buffSize[index]
    this.setData({
      buffIndex: index,
      oneTimeData: time
    })
  },
  printNumBindChange: function (res) { //更改打印份数
    var index = res.detail.value
    var num = this.data.printNum[index]
    this.setData({
      printNumIndex: index,
      printerNum: num
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
    //   success: function(res) {
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