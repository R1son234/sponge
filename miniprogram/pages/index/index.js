Page({
  data: {
    username: ''
  },
  onLoad() {
    // 检查是否已登录
    const app = getApp()
    if (app.globalData.userInfo && app.globalData.userInfo.username) {
      this.setData({
        username: app.globalData.userInfo.username
      })
    }
  }
})