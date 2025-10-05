// app.js
const authService = require('./utils/authService');

App({
  onLaunch() {
    console.log('冥想助手小程序启动');
    
    // 初始化全局数据
    this.initGlobalData();
    
    // 清除demo账号会话数据
    this.clearDemoSession();
    
    // 检查登录状态并尝试自动登录
    this.checkLoginStatus();
    
    // 初始化数据（开发环境使用）
    if (wx.getAppBaseInfo().environment === 'wxdevtools') {
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
    // 检查云开发是否可用
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-5g954c7x8a550d0d', // 云开发环境ID
        traceUser: true,
      });
    } else {
      console.warn('云开发环境不可用，请检查微信开发者工具版本');
    }
    this.globalData = {
      isLoggedIn: false,
      userInfo: null,
      baseURL: '', // 使用云开发，无需外部API地址
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
      
      // 检查是否是demo账号
      const clearDemoSession = require('./utils/clearDemoSession');
      if (clearDemoSession.isDemoAccount(userInfo)) {
        console.log('检测到demo账号，强制登出');
        authService.logout();
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
        console.log('demo账号已强制登出');
      } else {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = userInfo;
        console.log('用户已登录:', userInfo);
      }
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
  
  // 开发环境数据初始化（已禁用，使用真实数据）
  async initDevelopmentData() {
    console.log('开发环境数据初始化已禁用，使用真实用户数据');
    // 不再调用不存在的initData云函数，避免demo账号问题
  },
  
  // 清除demo账号会话数据
  clearDemoSession() {
    const clearDemoSession = require('./utils/clearDemoSession');
    const cleared = clearDemoSession.clearDemoSession();
    if (cleared) {
      console.log('demo账号会话数据已清除');
    }
  }
});