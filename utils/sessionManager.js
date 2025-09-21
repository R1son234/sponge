// utils/sessionManager.js - 会话管理工具
const SESSION_KEY = 'user_session';
const TOKEN_KEY = 'auth_token';

/**
 * 保存用户会话
 * @param {object} userInfo - 用户信息
 * @param {string} token - 认证令牌
 */
const saveSession = (userInfo, token) => {
  try {
    wx.setStorageSync(SESSION_KEY, userInfo);
    wx.setStorageSync(TOKEN_KEY, token);
    console.log('会话保存成功');
  } catch (error) {
    console.error('保存会话失败:', error);
  }
};

/**
 * 获取用户会话
 * @returns {object} 用户会话信息
 */
const getSession = () => {
  try {
    const userInfo = wx.getStorageSync(SESSION_KEY);
    const token = wx.getStorageSync(TOKEN_KEY);
    return { userInfo, token };
  } catch (error) {
    console.error('获取会话失败:', error);
    return { userInfo: null, token: null };
  }
};

/**
 * 清除用户会话
 */
const clearSession = () => {
  try {
    wx.removeStorageSync(SESSION_KEY);
    wx.removeStorageSync(TOKEN_KEY);
    console.log('会话清除成功');
  } catch (error) {
    console.error('清除会话失败:', error);
  }
};

/**
 * 检查会话是否有效
 * @returns {boolean} 会话是否有效
 */
const isSessionValid = () => {
  const session = getSession();
  return !!(session.userInfo && session.token);
};

/**
 * 获取认证令牌
 * @returns {string|null} 认证令牌
 */
const getAuthToken = () => {
  try {
    return wx.getStorageSync(TOKEN_KEY);
  } catch (error) {
    console.error('获取认证令牌失败:', error);
    return null;
  }
};

module.exports = {
  saveSession,
  getSession,
  clearSession,
  isSessionValid,
  getAuthToken
};