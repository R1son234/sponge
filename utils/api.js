// utils/api.js - 网络请求工具函数
const app = getApp();

/**
 * 统一的网络请求方法
 * @param {string} url - 请求URL
 * @param {object} options - 请求选项
 * @returns {Promise} Promise对象
 */
const request = (url, options = {}) => {
  const { method = 'GET', data = {}, header = {} } = options;
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseURL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {object} params - 查询参数
 * @returns {Promise} Promise对象
 */
const get = (url, params = {}) => {
  return request(url, { method: 'GET', data: params });
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const post = (url, data = {}) => {
  return request(url, { method: 'POST', data });
};

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const put = (url, data = {}) => {
  return request(url, { method: 'PUT', data });
};

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const del = (url, data = {}) => {
  return request(url, { method: 'DELETE', data });
};

// 冥想相关API
const meditationAPI = {
  // 获取冥想类型
  getTypes: () => get('/api/meditation/types'),
  
  // 获取冥想记录
  getRecords: (userId) => get(`/api/meditation/records/${userId}`),
  
  // 获取冥想统计
  getStats: (userId) => get(`/api/meditation/stats/${userId}`),
  
  // 记录冥想
  record: (data) => post('/api/meditation/record', data)
};

// 用户相关API
const userAPI = {
  // 获取用户信息
  getUser: (userId) => get(`/api/user/${userId}`),
  
  // 创建用户
  createUser: (data) => post('/api/user', data)
};

// 好友相关API
const friendsAPI = {
  // 获取好友列表
  getFriends: (userId) => get(`/api/friends/${userId}`),
  
  // 获取好友动态
  getActivities: (userId) => get(`/api/friends/activities/${userId}`),
  
  // 发送好友请求
  sendRequest: (data) => post('/api/friends/request', data)
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  meditationAPI,
  userAPI,
  friendsAPI
};