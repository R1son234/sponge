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
    loading: true,
    error: null,
    // 日历数据
    calendarData: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据并重新生成日历
    this.loadData();
    this.generateCalendarData(this.data.records);
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
      
      // 生成日历数据
      this.generateCalendarData(records || []);
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ 
        error: '数据加载失败，请重试',
        loading: false 
      });
    }
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

  // 生成日历数据
  generateCalendarData(records) {
    const { currentMonth, currentYear } = this.data;
    
    // 获取当前月的第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // 计算日历需要显示的天数（包括上个月和下个月的部分）
    // 修正日历逻辑：从周日开始排列日历
    // JavaScript getDay()返回：0=周日, 1=周一, ..., 6=周六
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    
    // 重新计算起始日期：让日历从周日开始
    // 如果10月1日是周三(3)，需要向前3天到周日(0)
    const daysToSubtract = firstDayOfWeek;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const calendarDays = [];
    const currentDate = new Date(startDate);
    
    // 生成日历天数（42天，6行×7列）
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === currentDate.toDateString();
      });
      
      calendarDays.push({
        date: new Date(currentDate),
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        hasRecord: dayRecords.length > 0,
        recordCount: dayRecords.length,
        totalDuration: dayRecords.reduce((sum, record) => sum + (record.duration || 0), 0)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.setData({
      calendarData: calendarDays,
      currentMonth,
      currentYear
    });
  },

  // 切换到上个月
  prevMonth() {
    let { currentMonth, currentYear } = this.data;
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    
    this.setData({ currentMonth, currentYear });
    this.generateCalendarData(this.data.records);
  },

  // 切换到下个月
  nextMonth() {
    let { currentMonth, currentYear } = this.data;
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    
    this.setData({ currentMonth, currentYear });
    this.generateCalendarData(this.data.records);
  },

  // 错误重试
  retry() {
    this.loadData();
  }
});