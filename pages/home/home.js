// pages/home/home.js
const app = getApp();
const api = require('../../utils/api');
const meditationAPI = api.meditationAPI;
const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    stats: null,
    quickMeditations: [
      { id: '1', name: '快速放松', duration: 5, icon: 'success', description: '适合忙碌生活中的短暂休息，让身心快速恢复平静' },
      { id: '2', name: '专注呼吸', duration: 10, icon: 'love', description: '通过专注呼吸，提高注意力，缓解焦虑情绪' },
      { id: '3', name: '深度冥想', duration: 20, icon: 'star', description: '深度放松身心，获得内心的宁静与平和' }
    ],
    loading: true,
    error: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadData();
  },

  async loadData() {
    // 检查登录状态
    if (!authService.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    try {
      this.setData({ loading: true, error: null });
      
      // 获取当前用户ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser._id;
      
      // 获取冥想统计
      const stats = await meditationAPI.getStats(userId);
      this.setData({ stats, loading: false });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ 
        error: '数据加载失败，请重试',
        loading: false 
      });
    }
  },

  // 快速开始冥想
  handleQuickStart(e) {
    const { meditation } = e.currentTarget.dataset;
    console.log('快速开始冥想:', meditation.name);
    
    // 跳转到冥想页面，传递冥想信息
    wx.navigateTo({
      url: `/pages/meditation/meditation?quickStart=${encodeURIComponent(JSON.stringify({
        name: meditation.name,
        duration: meditation.duration,
        description: meditation.description
      }))}`
    });
  },

  // 跳转到打卡页面
  navigateToCheckin() {
    wx.switchTab({
      url: '/pages/checkin/checkin'
    });
  },

  // 跳转到冥想页面
  navigateToMeditation() {
    wx.switchTab({
      url: '/pages/meditation/meditation'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 错误重试
  retry() {
    this.loadData();
  }
});