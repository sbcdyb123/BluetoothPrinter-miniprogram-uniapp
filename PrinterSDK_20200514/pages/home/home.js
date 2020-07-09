// pages/blueconn/blueconn.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },
  blueTooth:function(){
    wx.navigateTo({
      url: '../bleConnect/bleConnect',
    })
  },
  //打印指令页面
  printTest: function () {
    wx.navigateTo({
      url: '../sendCommand/sendCommand',
    })
  },
  //小票案例
  recipt: function () {
    wx.navigateTo({
      url: '../receipt/receipt',
    })
  },
  //标签案例
  label: function () {
    wx.navigateTo({
      url: '../label/label',
    })
  },
  //蓝牙配网页面
  blueToothNet: function () {
    wx.navigateTo({
      url: '../net/net',
    })
  },
  //打印彩票
  lotteryTicket: function () {
    wx.navigateTo({
      url: '../ticket/ticket',
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
  wx.closeBLEConnection({
      deviceId: app.BLEInformation.deviceId,
      success: function(res) {
        console.log("关闭蓝牙成功")
      },
    })
  },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {
  //   var that = this
  //   wx.startPullDownRefresh({})
  //   that.startSearch()
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