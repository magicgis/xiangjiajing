var util = require('../../../utils/util.js')
var UDPCom = require('../../../utils/api/UDPCom/UDPCom.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    connectWifiName: '',
    password1:'',
    password2:'',
    wifiListViewShow: false,
    versionsViewShow:false,
    softwareVersion:'',
    wifiListItems: [],
    deviceInfo: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      deviceInfo: app.globalData.mainDeviceInfo,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getConnectWifi_onshow()
  },
  // 是否开启WI-FI列表
  wifiListClk: function() {
    var that = this
    that.getConnectWifi_Clk()
  },
  //WIFI列表选项选择
  wifiViewChangeClk: function(e) {
    var that = this
    var clkNum = e.currentTarget.dataset.id
    that.setData({
      connectWifiName: that.data.wifiListItems[clkNum].SSID,
      wifiListViewShow: false
    })
  },
  //Wi-Fi列表选择取消
  wifiViewCancelClk: function() {
    this.setData({
      wifiListViewShow: false
    })
  },
  //初载获取已连接WIFI信息，并检测WI-FI开关是否开启
  getConnectWifi_onshow: function() {
    var that = this
    wx.startWifi()
    wx.getConnectedWifi({
      success: function(res) {
        //iOS系统时，无errCode这个字段
        if ((res.errCode == 0)|| (res.errMsg == "getConnectedWifi:ok")) {
          that.setData({
            connectWifiName: res.wifi.SSID
          })
        }
      },
      fail: function (res) {
      }
    })
  },
  //点击检测WI-FI开关是否开启
  getConnectWifi_Clk: function() {
    var that = this

    wx.getConnectedWifi({
      success: function(res) {
        that.getWifiList()
      },
      fail: function(res) {
        if (res.errCode == 12005) {
          util.showToast("请先打开WI-FI开关")
        } else {
          that.getWifiList()
        }
      }
    })
  },
  // 获取附近WIFI列表
  getWifiList: function() {
    var that = this
    wx.getWifiList({
      success: function (res) {},
      fail: function (res) {}
    })
    wx.onGetWifiList(function(res) {
      that.setData({
        wifiListViewShow: true,
        wifiListItems: res.wifiList
      })
    })
  },
  // WIFI名称输入
  wifinameInput: function (e) {
    this.setData({
      connectWifiName: e.detail.value
    })
    console.log("wifinameInput")
    console.log(e)
  },
  // 密码1输入
  passwordInput: function (e) {
    this.data.password1 = e.detail.value
  },
  // 密码2输入
  passwordAgainInput: function (e) {
    this.data.password2 = e.detail.value
  },
  // 设置按钮
  setClk: function() {
    var that = this;
    if (that.data.connectWifiName.length == 0){
      util.showToast('请选择或输入要设置的WI-FI名称')
    } else if((that.data.password1.length == 0) || (that.data.password2.length == 0)) {
      util.showToast('请输入WIFI的密码')
    } else if (that.data.password1 != that.data.password2) {
      util.showToast('2次输入的密码不一致')
    } else {

      UDPCom.sendUDP_SetWIFI(that.data.deviceInfo.UID, that.data.connectWifiName, that.data.password1, {
        successHandler(result) {
          UDPCom.sendUDP_Restart(that.data.deviceInfo.UID,{
            successHandler(result) {
              util.showToast("设置WI-FI成功，返回设备列表页面")
              setTimeout(function () { 
                wx.switchTab({
                  url: '../../deviceList/deviceList'
                })
              }, 1500);
            },
            failHandler: function (result) { 
              util.showToast("设置WI-FI失败")
            }
          })
         },
        failHandler: function (result) { 
          util.showToast("设置WI-FI失败")
        }
      })

    }
  },
})