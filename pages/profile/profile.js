// pages/profile/profile.js
const app = getApp();
const api = require('../../utils/api');
const userAPI = api.userAPI;
const meditationAPI = api.meditationAPI;

const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    userInfo: null,
    stats: null,
    loading: true,
    error: null,
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus();
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.checkLoginStatus();
    this.loadData();
  },

  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    
    if (!isLoggedIn) {
      this.setData({ loading: false });
    }
  },

  async loadData() {
    if (!this.data.isLoggedIn) return;

    try {
      this.setData({ loading: true, error: null });
      
      // 获取用户信息和统计
      // 获取当前用户ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser._id;

      const [userInfo, stats] = await Promise.all([
        userAPI.getUser(userId),
        meditationAPI.getStats(userId)
      ]);
      
      this.setData({ 
        userInfo: userInfo || {},
        stats: stats || {},
        loading: false 
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ 
        error: '数据加载失败，请重试',
        loading: false 
      });
    }
  },

  // 登录处理
  handleLogin() {
    // 这里应该跳转到登录页面或调用微信登录API
    wx.showModal({
      title: '登录提示',
      content: '请使用微信登录功能',
      showCancel: false
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.logout();
        }
      }
    });
  },

  logout() {
    // 清除登录状态
    wx.removeStorageSync('token');
    wx.removeStorageSync('userId');
    app.globalData.isLoggedIn = false;
    app.globalData.userId = null;
    
    this.setData({
      isLoggedIn: false,
      userInfo: null,
      stats: null
    });
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  },

  // 编辑个人信息
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  // 查看设置
  viewSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 查看帮助
  viewHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 格式化时间
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  },

  // 错误重试
  retry() {
    this.loadData();
  }
});