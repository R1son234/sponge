// pages/meditation/meditation.js
const app = getApp();
const api = require('../../utils/api');
const meditationAPI = api.meditationAPI;
const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    meditationTypes: [],
    currentSession: null,
    isRecording: false,
    elapsedTime: 0,
    timer: null,
    quickStartData: null,
    loading: true,
    error: null
  },

  onLoad(options) {
    // 解析快速开始参数
    if (options.quickStart) {
      try {
        const quickStart = JSON.parse(decodeURIComponent(options.quickStart));
        this.setData({ quickStartData: quickStart });
      } catch (error) {
        console.error('解析快速开始参数失败:', error);
      }
    }
    
    this.loadMeditationTypes();
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  async loadMeditationTypes() {
    try {
      this.setData({ loading: true, error: null });
      
      const types = await meditationAPI.getTypes();
      this.setData({ 
        meditationTypes: types,
        loading: false 
      });
    } catch (error) {
      console.error('加载冥想类型失败:', error);
      this.setData({ 
        error: '加载冥想类型失败',
        loading: false 
      });
    }
  },

  // 开始冥想
  startMeditation(type) {
    console.log('开始冥想:', type);
    
    this.setData({
      isRecording: true,
      currentSession: {
        type: type,
        startTime: new Date(),
        duration: 0
      }
    });

    // 启动计时器
    const timer = setInterval(() => {
      if (this.data.isRecording) {
        const elapsedTime = Math.floor((Date.now() - this.data.currentSession.startTime.getTime()) / 1000);
        this.setData({ elapsedTime });
      }
    }, 1000);

    this.setData({ timer });
  },

  // 停止冥想
  async stopMeditation() {
    if (!this.data.currentSession) return;

    // 检查登录状态
    if (!authService.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    try {
      const duration = Math.floor(this.data.elapsedTime / 60); // 转换为分钟
      
      // 获取当前用户ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser._id;
      
      await meditationAPI.record({
        userId: userId,
        type: this.data.currentSession.type,
        duration: duration,
        notes: '小程序冥想记录'
      });

      // 重置状态
      this.resetSession();
      
      wx.showToast({
        title: `冥想完成，时长${duration}分钟`,
        icon: 'success'
      });

    } catch (error) {
      console.error('记录冥想失败:', error);
      wx.showToast({
        title: '记录失败',
        icon: 'error'
      });
    }
  },

  // 暂停冥想
  pauseMeditation() {
    this.setData({ isRecording: false });
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  // 恢复冥想
  resumeMeditation() {
    this.setData({ isRecording: true });
    
    const timer = setInterval(() => {
      if (this.data.isRecording) {
        const elapsedTime = this.data.elapsedTime + 1;
        this.setData({ elapsedTime });
      }
    }, 1000);

    this.setData({ timer });
  },

  // 重置会话
  resetSession() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    this.setData({
      isRecording: false,
      currentSession: null,
      elapsedTime: 0,
      timer: null
    });
  },

  // 快速开始处理
  handleQuickStart() {
    if (this.data.quickStartData) {
      this.startMeditation(this.data.quickStartData.name);
    }
  },

  // 错误重试
  retry() {
    this.loadMeditationTypes();
  }
});