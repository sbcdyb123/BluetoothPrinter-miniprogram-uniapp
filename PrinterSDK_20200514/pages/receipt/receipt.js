var app = getApp();
var esc = require("../../utils/esc.js");
var encode = require("../../utils/encoding.js");
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
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

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
  data[offset + 1] = value;
  data[offset + 2] = value;
}

function adjustPixel(data, offset, value) {
  data[offset] += value;
}

// 彩色图转成单色图
function convertToMonoImage(width, height, data, shake) {
  let g = 0
  let e = 0

  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let dataOffset = (width * y + x) * 4;
      g = data[dataOffset];
      if (g >= 150) {  // 灰色转黑白的阈值, 可以调整打印效果
        e = g - 255;
        setPixel(data, dataOffset, 255);
      } else {
        e = g;
        setPixel(data, dataOffset, 0);
      }

      if (!shake)
        continue;

      if (x < width - 1 && y < height - 1) {
        //右边像素处理
        data[(width * y + x + 1) * 4] += 7 * e / 16;
        //下
        data[(width * (y + 1) + x) * 4] += 5 * e / 16;
        //右下
        data[(width * (y + 1) + x + 1) * 4] += e / 16;
        //左下
        if (x > 0) {
          data[(width * (y + 1) + x - 1) * 4] += 3 * e / 16;
        }
      } else if (x == width - 1 && y < height - 1) {
        //下方像素处理
        data[(width * (y + 1) + x) * 4] += 5 * e / 16;
      } else if (x < width - 1 && y == height - 1) {
        //右边像素处理
        data[(width * y + x + 1) * 4] += 7 * e / 16;
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
    looptime: 0,
    currentTime: 1,
    lastData: 0,
    oneTimeData: 0,
    buffSize: [],
    buffIndex: 0, //发送字节数下标
    printNum: [],
    printNumIndex: 0,
    printerNum: 1,
    currentPrint: 1,
    isReceiptSend: false,
    isQuery: false,
    imageSrc: '../../imags/wechat.png',
    jpgSrc: '../../imags/flower2.jpg',
    canvasWidth: 100,
    canvasHeight: 100,
    jpgWidth: 200,
    jpgHeight: 200,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.canvas();
  },
  initPhoto:function() {//初始化画布数据
    //创建一个png格式
     var that = this
     const ctx_out = wx.createCanvasContext('canvasOut', this);
     var png = that.data.imageSrc;
     wx.getImageInfo({
       src: png,
      success(res) {
        that.setData({
          canvasWidth: res.width,
          canvasHeight: res.height,
        });
        console.log("画布宽度" + res.width, "画布高度"+res.height);
        ctx_out.drawImage(png, 0, 0, res.width, res.height);
        ctx_out.draw();
      }
    })
    //创建一个jpg格式图片
    const ctx_jpg = wx.createCanvasContext('canvasJPG', this);
    var jpg_width = that.data.jpgWidth;
    var jpg_height = that.data.jpgHeight;
    var img = that.data.jpgSrc;
    wx.getImageInfo({
      src: img,
      success(res) {
        that.setData({
          jpgWidth: res.width,
          jpgHeight: res.height,
        });
        console.log("JPG画布宽度" + res.width, "JPG画布高度" + res.height);
        ctx_jpg.drawImage(img, 0, 0, res.width, res.height);
        ctx_jpg.draw();
      }
    })
  },
  receiptTest: function() { //票据测试
    var that = this;
    var canvasWidth = that.data.canvasWidth
    var canvasHeight = that.data.canvasHeight
    var command = esc.jpPrinter.createNew()
    command.init() //初始化打印机
    command.setSelectJustification(1) //居中
    command.setCharacterSize(17); //设置倍高倍宽
    command.setText("票据测试");
    command.setPrint(); //打印并换行
    command.setCharacterSize(0); //设置正常大小
    command.setSelectJustification(0) //设置居左
    command.setText("打印对齐方式测试：")
    command.setPrint() //打印并换行
    command.setSelectJustification(0) //设置居左
    command.setText("居左")
    command.setPrint() //打印并换行
    command.setSelectJustification(1) //设置居中
    command.setText("居中")
    command.setPrint()
    command.setSelectJustification(2)
    command.setText("居右");
    command.setPrint()
    command.setSelectJustification(0)
    command.setText("同行打印位置测试：");
    command.setPrint()
    command.setText("居左");
    command.setAbsolutePrintPosition(168)
    command.setText("居中");
    command.setAbsolutePrintPosition(336)
    command.setText("居右");
    command.setPrint()
    command.init() //初始化打印机
    command.setPrint()
    command.setText("条码打印");
    command.setPrint()
    command.setHRIPosition(2) //设置HRI位置
    command.setHRIFont(0) //HRI字体大小
    command.setBarcodeHeight(60) //条码高度
    command.setBarcodeWidth(2) //设置条码宽度
    command.setAbsolutePrintPosition(24)
    command.setCode128("{A12345678"); //code128  A类型
    command.setPrint()
    command.setText("二维码测试:")
    command.setPrint()
    command.setSelectSizeOfModuleForQRCode(5)
    command.setSelectErrorCorrectionLevelForQRCode(49)
    command.setStoreQRCodeData("http://www.howbest.cn/cn/")
    command.setPrintQRCode()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    command.setPrint()
    that.prepareSend(command.getData())//准备发送数据
    
  },
  printPhoto:function(){//打印bitmap，图片内容不建议太大，小程序限制传输的字节数为20byte
    var that = this;
    var canvasWidth = that.data.canvasWidth
    var canvasHeight = that.data.canvasHeight
    var command = esc.jpPrinter.createNew()
    command.init() //初始化打印机
    wx.canvasGetImageData({
      canvasId: 'canvasOut',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: function (res) {
        console.log("获取画布数据成功")
        command.setBitmap(res)
        command.setPrint()
        that.prepareSend(command.getData())//发送数据
      },
      complete: function (res) {
        console.log("finish")
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '获取画布数据失败',
          icon: 'none',
        })
      }
    })
  }, 
  printJPGPhoto:function(){
    var that = this;
    var canvasWidth = that.data.jpgWidth
    var canvasHeight = that.data.jpgHeight

    //抖动处理JPG图片
    const cfg = {
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    }
    wx.canvasGetImageData({
      canvasId: 'canvasJPG',
      ...cfg,
      success: (res) => {
        //const data = convertToGrayscale(res.data)
        const data = convertToMonoImage(res.width, res.height, res.data, true);
        wx.canvasPutImageData({
          canvasId: 'canvasJPG',
          data,
          ...cfg,
          success: (res) => {
            console.log(res)
            console.log('deal graphic width: ' + cfg.width)
            console.log('deal graphic width: ' + cfg.height)
            that.printerJPG();
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
  printerJPG: function(){
    var that=this;
    var canvasWidth = that.data.jpgWidth
    var canvasHeight = that.data.jpgHeight
    var command = esc.jpPrinter.createNew()
    command.init() //初始化打印机
    wx.canvasGetImageData({
      canvasId: 'canvasJPG',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: function (res) {
        console.log("获取画布数据成功")
        command.setBitmap(res)
        command.setPrint()
        that.prepareSend(command.getData())//发送数据
      },
      complete: function (res) {
        console.log("finish")
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '获取画布数据失败',
          icon: 'none',
        })
      }
    })
  },
  prepareSend: function(buff) { //准备发送，根据每次发送字节数来处理分包数量
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
  queryStatus: function() { //查询打印机状态
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
      success: function(res) {
        console.log("发送成功")
        that.setData({
          isQuery: true
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '发送失败',
          icon: 'none',
        })
        //console.log(e)
        return;
      },
      complete: function() {

      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: app.BLEInformation.deviceId,
      serviceId: app.BLEInformation.notifyServiceId,
      characteristicId: app.BLEInformation.notifyCharaterId,
      state: true,
      success: function(res) {
        wx.onBLECharacteristicValueChange(function(r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
          var result = ab2hex(r.value)
          console.log("返回" + result)
          var tip = ''
          if (result == 12) { //正常
            tip = "正常"
          } else if (result == 32) { //缺纸
            tip = "缺纸"
          } else if (result == 36) { //开盖、缺纸
            tip = "开盖、缺纸"
          } else if (result == 16) {
            tip = "开盖"
          } else if (result == 40) { //其他错误
            tip = "其他错误"
          } else { //未处理错误
            tip = "未知错误"
          }
          wx.showModal({
            title: '打印机状态',
            content: tip,
            showCancel: false
          })

        })
      },
      fail: function(e) {
        wx.showModal({
          title: '打印机状态',
          content: '获取失败',
          showCancel: false
        })
        console.log(e)
      },
      complete: function(e) {
        that.setData({
          isQuery: false
        })
        console.log("执行完成")
      }
    })
  },
  Send: function(buff) { //分包发送
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
      success: function(res) {
        if (currentTime <= loopTime) {
          // wx.showLoading({
          //   title: '传输中...',
          // })
        } else {
          wx.showToast({
            title: '已打印第' + currentPrint + '张成功',
          })
        }
        //console.log(res)
      },
      fail: function(e) {
        wx.showToast({
          title: '打印第' + currentPrint + '张失败',
          icon: 'none',
        })
        //console.log(e)
      },
      complete: function() {
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
  onReady: function() {
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
    this.initPhoto();
  },
  buffBindChange: function(res) { //更改打印字节数
    var index = res.detail.value
    var time = this.data.buffSize[index]
    this.setData({
      buffIndex: index,
      oneTimeData: time
    })
  },
  printNumBindChange: function(res) { //更改打印份数
    var index = res.detail.value
    var num = this.data.printNum[index]
    this.setData({
      printNumIndex: index,
      printerNum: num
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //关闭蓝牙连接
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
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})