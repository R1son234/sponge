// app.js
const authService = require('./utils/authService');

App({
  onLaunch() {
    console.log('冥想助手小程序启动');
    
    // 初始化全局数据
    this.initGlobalData();
    
    // 检查登录状态并尝试自动登录
    this.checkLoginStatus();
    
    // 初始化数据（开发环境使用）
    if (wx.getSystemInfoSync().platform === 'devtools') {
      this.initDevelopmentData();
    }
  },
  
  onShow() {
    console.log('小程序显示');
  },
  
  onHide() {
    console.log('小程序隐藏');
  },
  
  onError(error) {
    console.error('小程序发生错误:', error);
    // 可以在这里添加错误上报逻辑
  },
  
  // 初始化全局数据（含云开发配置）
  initGlobalData() {
    wx.cloud.init({
      env: 'cloud1-5g954c7x8a550d0d', // 云开发环境ID
      traceUser: true,
    });
    this.globalData = {
      isLoggedIn: false,
      userInfo: null,
      baseURL: 'https://api.example.com', // API地址（演示用）
      // 事件总线用于页面间通信
      eventBus: {
        events: {},
        emit(eventName, data) {
          if (this.events[eventName]) {
            this.events[eventName].forEach(fn => fn(data));
          }
        },
        on(eventName, fn) {
          this.events[eventName] = this.events[eventName] || [];
          this.events[eventName].push(fn);
        },
        off(eventName, fn) {
          if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(
              callback => callback !== fn
            );
          }
        }
      }
    };
  },
  
  // 检查登录状态
  checkLoginStatus() {
    if (authService.isLoggedIn()) {
      const userInfo = authService.getCurrentUser();
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
      console.log('用户已登录:', userInfo);
    } else {
      console.log('用户未登录');
    }
  },
  
  // 用户登录成功回调
  onUserLogin(userInfo, token) {
    this.globalData.isLoggedIn = true;
    this.globalData.userInfo = userInfo;
    
    // 通知所有页面用户登录状态变化
    this.globalData.eventBus.emit('userLogin', userInfo);
    
    console.log('用户登录成功:', userInfo);
  },
  
  // 用户登出回调
  onUserLogout() {
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
    
    // 通知所有页面用户登出状态变化
    this.globalData.eventBus.emit('userLogout');
    
    console.log('用户已登出');
  },
  
  // 获取当前用户ID
  getCurrentUserId() {
    return this.globalData.userInfo ? this.globalData.userInfo._id : null;
  },
  
  // 检查是否已登录，如果未登录则跳转到登录页
  requireLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  },
  
  // 开发环境数据初始化
  async initDevelopmentData() {
    try {
      // 调用云函数初始化数据
      const result = await wx.cloud.callFunction({
        name: 'initData',
        data: {
          action: 'initAll'
        }
      });
      
      console.log('开发环境数据初始化完成:', result);
    } catch (error) {
      console.warn('开发环境数据初始化失败:', error);
    }
  }
});