// utils/clearDemoSession.js - 清除demo账号会话数据工具

/**
 * 检查并清除demo账号的会话数据
 */
const clearDemoSession = () => {
  try {
    // 检查当前会话
    const session = wx.getStorageSync('user_session');
    const token = wx.getStorageSync('auth_token');
    
    if (session) {
      // 检查是否是demo账号
      if (session.username === 'demo' || 
          session.email === 'demo@example.com' ||
          session._id === '507f1f77bcf86cd799439011') {
        
        console.log('检测到demo账号会话，正在清除...');
        
        // 清除会话数据
        wx.removeStorageSync('user_session');
        wx.removeStorageSync('auth_token');
        
        console.log('demo账号会话已清除');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('清除会话失败:', error);
    return false;
  }
};

/**
 * 检查是否是demo账号
 * @param {object} userInfo - 用户信息
 * @returns {boolean} 是否是demo账号
 */
const isDemoAccount = (userInfo) => {
  if (!userInfo) return false;
  
  return userInfo.username === 'demo' || 
         userInfo.email === 'demo@example.com' ||
         userInfo._id === '507f1f77bcf86cd799439011';
};

module.exports = {
  clearDemoSession,
  isDemoAccount
};