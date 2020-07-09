// pages/sendCommand/sendCommand.js

/**
 * 此Demo仅供参考，可打印数字，英文，符号，中文，
 * 小程序支持的蓝牙为低功耗蓝牙（BLE），数据量大需分包发送
 */

var app = getApp();
var tsc = require("../../utils/tsc.js");
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

function setPixel(data, offset, value) {
  data[offset] = value;
  data[offset+1] = value;
  data[offset+2] = value;
}

function adjustPixel(data, offset, value) {
  data[offset] += value;
}

// 彩色图转成单色图
function convertToMonoImage(width, height, data, shake) {
  let g = 0
  let e = 0

  for(let i=0; i<data.length; i+=4) {
    data[i] = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
  }

  for(let y=0; y<height; y++) {
    for(let x=0; x<width; x++) {
      let dataOffset = (width * y + x) * 4;
      g = data[dataOffset];
      if(g >= 150) {  // 灰色转黑白的阈值, 可以调整打印效果
        e = g - 255;
        setPixel(data, dataOffset, 255);
      } else {
        e = g;
        setPixel(data, dataOffset, 0);
      }

      if(!shake)
        continue;

      if (x < width - 1 && y < height - 1) {
        //右边像素处理
        data[(width * y + x + 1)*4] += 7 * e / 16;
        //下
        data[(width * (y + 1) + x)*4] += 5 * e / 16;
        //右下
        data[(width * (y + 1) + x + 1)*4] += e / 16;
        //左下
        if (x > 0) {
          data[(width * (y + 1) + x - 1)*4] += 3 * e / 16;
        }
      } else if (x == width - 1 && y < height - 1) {
        //下方像素处理
        data[(width * (y + 1) + x)*4] += 5 * e / 16;
      } else if (x < width - 1 && y == height - 1) {
        //右边像素处理
        data[(width * y + x + 1)*4] += 7 * e / 16;
      }
    }
  }
  return data
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendContent: "",
    looptime: 0,
    currentTime: 1,
    lastData: 0,
    oneTimeData: 0,
    returnResult: "",
    canvasWidth: 180,
    canvasHeight: 180,
    imageSrc: '../../imags/abc_ic_star_black_16dp.png',
    buffSize: [],
    buffIndex: 0,
    printNum: [],
    printNumIndex: 0,
    printerNum: 1,
    currentPrint: 1,
    isReceiptSend: false,
    isLabelSend: false
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

  inputEvent: function (e) { //获取输入内容
    this.setData({
      sendContent: e.detail.value
    })
  },

  sendData: function () { //输入框点击发送
    var data = this.data.sendContent + "\n"

    this.setData({
      looptime: 0
    })
    var content = new encode.TextEncoder(
      'gb18030', {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode(data);

    this.prepareSend(content)
  },

  labelTest: function () { //标签测试
    var that = this;
    var canvasWidth = that.data.canvasWidth
    var canvasHeight = that.data.canvasHeight
    var command = tsc.jpPrinter.createNew()
    command.setSize(48, 40)
    command.setGap(0)
    command.setCls()
    // command.setText(0, 30, "TSS24.BF2", 1, 1, "图片")
    // command.setQrcode(40, 120, "L", 4, "A", "www.gainscha.com佳博浩盛")
    // command.setText(60, 90, "TSS24.BF2", 1, 1, "佳博浩盛")
    // command.setText(170, 50, "TSS24.BF2", 1, 1, "小程序测试")
    // command.setText(170, 90, "TSS24.BF2", 1, 1, "测试数字12345678")
    // command.setText(170, 120, "TSS24.BF2", 1, 1, "测试英文abcdefg")
    // command.setText(170, 150, "TSS24.BF2", 1, 1, "测试符号/*-+!@#$")
    // command.setBarCode(170, 180, "EAN8", 64, 1, 0,3, 3, "1234567")

    wx.canvasGetImageData({
      canvasId: 'canvasOut',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: function (res) {
        console.log('res len= ' + res.data.length)
        command.setBitmap(60, 0, 1, res)
        command.setPrint(1)
        that.prepareSend(command.getData())
      },
      complete: function () {
        command.setPagePrint()
        that.setData({
          isLabelSend: true
        })
      }
    })

  },

  receiptTest: function () { //票据测试
    var that = this;
    var canvasWidth = that.data.canvasWidth
    var canvasHeight = that.data.canvasHeight
    var command = esc.jpPrinter.createNew()
    command.init()
    command.setText("票据测试!");
    command.setPrint()
    command.setText("This is a receipt test!!!")
    command.setPrint()
    command.setText("二维码测试:")
    command.setPrint()
    command.setSelectSizeOfModuleForQRCode(5)
    command.setSelectErrorCorrectionLevelForQRCode(49)
    command.setStoreQRCodeData("佳博浩盛打印机")
    command.setPrintQRCode()
    command.setPrint()
    command.setSelectJustification(0)
    command.setText("向左对齐")
    command.setPrint()
    command.setSelectJustification(1)
    command.setText("居中对齐")
    command.setPrint()
    command.setSelectJustification(2)
    command.setText("向右对齐")
    command.setPrint()
    command.setSelectJustification(0)
    command.setText("图片测试")
    command.setPrint()

    wx.canvasGetImageData({
      canvasId: 'canvasOut',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: function (res) {
        command.setBitmap(res)
        that.prepareSend(command.getData())
      },
      complete: function (res) {
        console.log("finish")
        command.setPrint()
        that.setData({
          isReceiptSend: true
        })
        //that.prepareSend(command.getData())
      }
    })

    // this.send(buff)
  },

  openAndDraw() {
    var that = this
    const MAX_WIDTH = 384;  // 58打印宽度
    //const MAX_WIDTH = 576;  // 80打印宽度
    const MAX_HEIGHT = 256;
    wx.chooseImage({
      success: (res) => {
        const ctx_in = wx.createCanvasContext('canvasIn', this);
        const ctx_out = wx.createCanvasContext('canvasOut', this);
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success(info) {
            console.log('origin width: ' + info.width)
            console.log('origin height: ' + info.height)
            var imgWidth = info.width;
            var imgHeight = info.height;
            var canWidth = imgWidth;
            var canHeight = imgHeight;
            var canScale = 1.0;

            // 按 MAX_WIDTH 调整图片宽度
            if(imgWidth > MAX_WIDTH) {
              canWidth = MAX_WIDTH;
              canScale = canWidth / imgWidth;
              canHeight = parseInt(canScale * imgHeight);
              console.log("scale = "+canScale);
              console.log('scale canvas width: ' + canWidth);
              console.log('scale canvas height: ' + canHeight);
            }

            // 按 MAX_HEIGHT 截取高度 (过多的部分会被裁剪掉)
            if(canHeight > MAX_HEIGHT) {
              canHeight = MAX_HEIGHT;
              imgHeight = parseInt(canHeight / canScale);
            }

            that.setData({
              canvasWidth: canWidth,
              canvasHeight: canHeight,
            });
            ctx_in.drawImage(res.tempFilePaths[0], 0, 0, imgWidth, imgHeight, 0, 0, canWidth, canHeight)
            ctx_in.draw()
            ctx_out.clearRect(0, 0, imgWidth, imgHeight)
            ctx_out.draw()
          }
        })
      }
    })
  },

  process() {
    var that = this

    const cfg = {
      x: 0,
      y: 0,
      width: that.data.canvasWidth,
      height: that.data.canvasHeight,
    }
    wx.canvasGetImageData({
      canvasId: 'canvasIn',
      ...cfg,
      success: (res) => {
        //const data = convertToGrayscale(res.data)
        const data = convertToMonoImage(res.width, res.height, res.data, true);
        wx.canvasPutImageData({
          canvasId: 'canvasOut',
          data,
          ...cfg,
          success: (res) => {
            console.log(res)
            console.log('deal graphic width: ' + cfg.width)
            console.log('deal graphic width: ' + cfg.height)
          },
          fail: (err) => {
            console.error(err)
          }
        })
      },
      fail: (err) => {
        console.error(err)
      }
    })
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

  queryStatus: function () { //查询打印机状态
    var command = esc.jpPrinter.Query();
    command.getRealtimeStatusTransmission(1);
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
        wx.showToast({
          title: '已打印第' + currentPrint + '张成功',
        })
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
              isLabelSend: false,
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