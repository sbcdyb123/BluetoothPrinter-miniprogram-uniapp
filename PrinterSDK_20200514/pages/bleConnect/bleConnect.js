// pages/blueconn/blueconn.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    services: [],
    serviceId: 0,
    writeCharacter: false,
    readCharacter: false,
    notifyCharacter: false,
    isScanning:false
  },
  //搜索设备
  startSearch: function () {
    var that = this
    wx.openBluetoothAdapter({
      success: function (res) {
        wx.getBluetoothAdapterState({
          success: function (res) {
            console.log('openBluetoothAdapter success', res)
            if (res.available) {
              if (res.discovering) {
                wx.stopBluetoothDevicesDiscovery({
                  success: function (res) {
                    console.log(res)
                  }
                })
              }else{
                // that.startBluetoothDevicesDiscovery()
                that.getBluetoothDevices()
              }
              // that.checkPemission()
            } else {
              wx.showModal({
                title: '提示',
                content: '本机蓝牙不可用',
                showCancel: false
              })
            }
          },
        })
      }, fail: function () {

        // if (res.errCode === 10001) {
        //   wx.onBluetoothAdapterStateChange(function (res) {
        //     console.log('onBluetoothAdapterStateChange', res)
        //     if (res.available) {
        //       this.startBluetoothDevicesDiscovery()
        //     }
        //   })
        // }

        wx.showModal({
          title: '提示',
          content: '蓝牙初始化失败，请到设置打开蓝牙',
          showCancel: false
        })
      }
    })
  },
  checkPemission: function () {  //android 6.0以上需授权地理位置权限
    var that = this
    var platform = app.BLEInformation.platform
    if (platform == "ios") {
      app.globalData.platform = "ios"
      that.getBluetoothDevices()
    } else if (platform == "android") {
      app.globalData.platform = "android"
      console.log(app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1))
      if (app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1) > 5) {
        wx.getSetting({
          success: function (res) {
            console.log(res)
            if (!res.authSetting['scope.userLocation']) {
              wx.authorize({
                scope: 'scope.userLocation',
                complete: function (res) {
                  that.getBluetoothDevices()
                }
              })
            } else {
              that.getBluetoothDevices()
            }
          }
        })
      }
    }
  },
  getBluetoothDevices: function () {  //获取蓝牙设备信息
    var that = this
    console.log("start search")
    wx.showLoading({
      title: '正在加载',
      icon: 'loading',
    })
    that.setData({
      isScanning:true
    })
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        setTimeout(function () {
          wx.getBluetoothDevices({
            success: function (res) {
              var devices = []
              var num = 0
              for (var i = 0; i < res.devices.length; ++i) {
                if (res.devices[i].name != "未知设备") {
                  devices[num] = res.devices[i]
                  num++
                }
              }
              that.setData({
                list: devices,
                isScanning:false
              })
              wx.hideLoading()
              wx.stopPullDownRefresh()
              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log("停止搜索蓝牙")
                }
              })
            },
          })
        }, 5000)
      },
    })
  },
  bindViewTap: function (e) {
    var that = this
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) { console.log(res) },
    })
    that.setData({
      serviceId: 0,
      writeCharacter: false,
      readCharacter: false,
      notifyCharacter: false
    })
    console.log(e.currentTarget.dataset.title)
    wx.showLoading({
      title: '正在连接',
      
    })
    wx.createBLEConnection({
      deviceId: e.currentTarget.dataset.title,
      success: function (res) {
        console.log(res)
        app.BLEInformation.deviceId = e.currentTarget.dataset.title
        that.getSeviceId()
      }, fail: function (e) {
        wx.showModal({
          title: '提示',
          content: '连接失败',
          showCancel: false
        })
        console.log(e)
        wx.hideLoading()
      }, complete: function (e) {
        console.log(e)
      }
    })
  },
  getSeviceId: function () {
    var that = this
    var platform = app.BLEInformation.platform
    console.log(app.BLEInformation.deviceId)
    wx.getBLEDeviceServices({
      deviceId: app.BLEInformation.deviceId,
      success: function (res) {
        console.log(res)
        // var realId = ''
        // if (platform == 'android') {
        //   // for(var i=0;i<res.services.length;++i){
        //   // var item = res.services[i].uuid
        //   // if (item == "0000FEE7-0000-1000-8000-00805F9B34FB"){
        //   realId = "0000FEE7-0000-1000-8000-00805F9B34FB"
        //   //       break;
        //   //     }
        //   // }
        // } else if (platform == 'ios') {
        //   // for(var i=0;i<res.services.length;++i){
        //   // var item = res.services[i].uuid
        //   // if (item == "49535343-FE7D-4AE5-8FA9-9FAFD205E455"){
        //   realId = "49535343-FE7D-4AE5-8FA9-9FAFD205E455"
        //   // break
        //   // }
        //   // }
        // }
        // app.BLEInformation.serviceId = realId
        that.setData({
          services: res.services
        })
        that.getCharacteristics()
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        console.log(e)
      }
    })
  },
  getCharacteristics: function () {
    var that = this
    var list = that.data.services
    var num = that.data.serviceId
    var write = that.data.writeCharacter
    var read = that.data.readCharacter
    var notify = that.data.notifyCharacter
    wx.getBLEDeviceCharacteristics({
      deviceId: app.BLEInformation.deviceId,
      serviceId: list[num].uuid,
      success: function (res) {
        console.log(res)
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties
          var item = res.characteristics[i].uuid
          if (!notify) {
            if (properties.notify) {
              app.BLEInformation.notifyCharaterId = item
              app.BLEInformation.notifyServiceId = list[num].uuid
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              app.BLEInformation.writeCharaterId = item
              app.BLEInformation.writeServiceId = list[num].uuid
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              app.BLEInformation.readCharaterId = item
              app.BLEInformation.readServiceId = list[num].uuid
              read = true
            }
          }
        }
        if (!write || !notify || !read) {
          num++
          that.setData({
            writeCharacter: write,
            readCharacter: read,
            notifyCharacter: notify,
            serviceId: num
          })
          if (num == list.length) {
            wx.showModal({
              title: '提示',
              content: '找不到该读写的特征值',
              showCancel: false
            })
          } else {
            that.getCharacteristics()
          }
        } else {
          wx.showToast({
            title: '连接成功',
          })
          that.openControl()
        }
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        console.log("write:" + app.BLEInformation.writeCharaterId)
        console.log("read:" + app.BLEInformation.readCharaterId)
        console.log("notify:" + app.BLEInformation.notifyCharaterId)
      }
    })
  },
   openControl: function () {//连接成功返回主页
    wx.navigateTo({
      url: '../home/home',
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.BLEInformation.platform = app.getPlatform()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {
  //     // var that = this
  //     // wx.startPullDownRefresh({})
  //     // that.startSearch()
  // },

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