//app.js
App({
  onLaunch: function () {
    this.globalData.sysinfo = wx.getSystemInfoSync()
  },
  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  },
  globalData: {
    userInfo: null,
    platform:"",
    screenWidth:wx.getSystemInfoSync().screenWidth,
    screenHeight:wx.getSystemInfoSync().screenHeight,
  },
  BLEInformation:{
    platform: "",
    deviceId:"",
    writeCharaterId: "",    
    writeServiceId: "",
    notifyCharaterId: "",
    notifyServiceId: "",
    readCharaterId: "",
    readServiceId: "",
  }
  
})