// pages/friends/friends.js
const app = getApp();
const api = require('../../utils/api');
const friendsAPI = api.friendsAPI;
const authService = require('../../utils/authService');

Page({
  data: {
    // 页面数据
    friends: [],
    activities: [],
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
      
      // 获取好友列表和动态
      const [friends, activities] = await Promise.all([
        friendsAPI.getFriends(userId),
        friendsAPI.getActivities(userId)
      ]);
      
      this.setData({ 
        friends: friends || [],
        activities: activities || [],
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



  // 添加好友
  async addFriend() {
    // 检查登录状态
    if (!authService.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    try {
      // 让用户输入好友的用户名
      wx.showModal({
        title: '添加好友',
        content: '请输入好友的用户名',
        editable: true,
        placeholderText: '好友的用户名',
        success: async (res) => {
          if (res.confirm && res.content.trim()) {
            const username = res.content.trim();
            
            wx.showLoading({ title: '发送请求中...' });
            
            // 获取当前用户信息
            const currentUser = authService.getCurrentUser();
            const currentUsername = currentUser.username;
            
            try {
              await friendsAPI.sendFriendRequest(currentUsername, username);
              
              wx.hideLoading();
              wx.showToast({
                title: '已发送申请',
                icon: 'success',
                duration: 2000
              });
            } catch (error) {
              wx.hideLoading();
              console.error('发送好友申请失败:', error);
              wx.showToast({
                title: error.message || '发送失败',
                icon: 'error',
                duration: 3000
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('添加好友失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  // 查看好友详情
  viewFriendDetail(e) {
    const friendId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/friend-detail/friend-detail?id=${friendId}`
    });
  },

  // 格式化时间
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
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