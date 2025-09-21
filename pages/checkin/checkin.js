// pages/checkin/checkin.js
const app = getApp();
const api = require('../../utils/api');
const meditationAPI = api.meditationAPI;
const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    stats: null,
    records: [],
    currentDate: new Date(),
    selectedDate: new Date(),
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
      
      // 获取冥想统计和记录
      const [stats, records] = await Promise.all([
        meditationAPI.getStats(userId),
        meditationAPI.getRecords(userId)
      ]);
      
      this.setData({ 
        stats,
        records: records || [],
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

  // 日期选择处理
  onDateChange(e) {
    const selectedDate = new Date(e.detail.value);
    this.setData({ selectedDate });
    this.filterRecordsByDate(selectedDate);
  },

  // 根据日期过滤记录
  filterRecordsByDate(date) {
    const filteredRecords = this.data.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === date.toDateString();
    });
    
    this.setData({ filteredRecords });
  },

  // 格式化日期
  formatDate(date) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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