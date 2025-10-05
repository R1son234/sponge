// pages/profile/profile.js
const app = getApp();
const api = require('../../utils/api');
const userAPI = api.userAPI;

const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    userInfo: null,
    loading: true,
    error: null,
    isLoggedIn: false
  },

  onLoad() {
    // 监听登录状态变化
    app.globalData.eventBus.on('userLogin', this.onUserLogin.bind(this));
    app.globalData.eventBus.on('userLogout', this.onUserLogout.bind(this));
    
    this.checkLoginStatus();
    
    // 如果未登录，直接跳转到登录页面
    if (!this.data.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.checkLoginStatus();
    
    // 如果未登录，直接跳转到登录页面
    if (!this.data.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.loadData();
  },

  onUnload() {
    // 移除事件监听
    app.globalData.eventBus.off('userLogin', this.onUserLogin.bind(this));
    app.globalData.eventBus.off('userLogout', this.onUserLogout.bind(this));
  },

  checkLoginStatus() {
    // 同时检查全局状态和authService状态
    const globalLoggedIn = app.globalData.isLoggedIn;
    const authLoggedIn = authService.isLoggedIn();
    const isLoggedIn = globalLoggedIn && authLoggedIn;
    
    this.setData({ isLoggedIn });
    
    if (!isLoggedIn) {
      this.setData({ loading: false });
    }
    
    console.log('profile页面登录状态检查:', {
      global: globalLoggedIn,
      auth: authLoggedIn,
      final: isLoggedIn
    });
    
    return isLoggedIn;
  },

  async loadData() {
    if (!this.data.isLoggedIn) return;

    try {
      this.setData({ loading: true, error: null });
      
      // 获取当前用户信息
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.username) {
        console.error('无法获取当前用户信息');
        this.setData({ 
          error: '无法获取用户信息，请重新登录',
          loading: false 
        });
        return;
      }
      
      // 使用云函数获取用户信息（通过username查询）
      const result = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {
          username: currentUser.username
        }
      });
      
      console.log('云函数返回的用户信息:', result);

      if (result.result && result.result.code === 200) {
        this.setData({ 
          userInfo: result.result.data || {},
          loading: false 
        });
        console.log('用户信息加载成功');
      } else {
        console.error('用户信息获取失败:', result.result);
        this.setData({ 
          error: '用户信息获取失败',
          loading: false 
        });
      }
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
    // 跳转到登录页面
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '是否确认退出账号？',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 点击确认，执行退出登录
          this.logout();
        }
        // 点击取消，直接关闭弹窗，不执行任何操作
      }
    });
  },

  logout() {
    // 清除登录状态
    authService.logout();
    app.globalData.isLoggedIn = false;
    app.globalData.userInfo = null;
    
    this.setData({
      isLoggedIn: false,
      userInfo: null
    });
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      success: () => {
        // 退出登录成功后跳转到登录页面
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }, 1500); // 延迟1.5秒，让用户看到退出成功的提示
      }
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



  // 用户登录事件处理
  onUserLogin(userInfo) {
    console.log('profile页面收到登录事件:', userInfo);
    this.setData({
      isLoggedIn: true
    });
    this.loadData();
  },

  // 用户登出事件处理
  onUserLogout() {
    console.log('profile页面收到登出事件');
    this.setData({
      isLoggedIn: false,
      userInfo: null
    });
  },

  // 错误重试
  retry() {
    this.loadData();
  }
});