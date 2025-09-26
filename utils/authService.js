// utils/authService.js - 用户认证服务
// 注意：调用此文件中的函数前，必须确保已经调用 wx.cloud.init()
const api = require('./api');
const sessionManager = require('./sessionManager');
const cryptoUtils = require('./cryptoUtils');

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  /**
   * 用户注册
   * @param {object} userData - 用户注册数据
   * @returns {Promise} 注册结果
   */
  async register(userData) {
    try {
      // 生成盐值和加密密码
      const salt = cryptoUtils.generateSalt();
      const hashedPassword = cryptoUtils.encryptPassword(userData.password, salt);
      
      const userInfo = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        salt: salt,
        nickname: userData.nickname || userData.username
      };

      const result = await api.userAPI.createUser(userInfo);
      
      if (result.success) {
        // 自动登录
        const loginResult = await this.login({
          username: userData.username,
          password: userData.password
        });
        
        return loginResult;
      }
      
      return result;
    } catch (error) {
      console.error('注册失败:', error);
      throw new Error(error.message || '注册失败，请重试');
    }
  }

  /**
   * 用户登录
   * @param {object} credentials - 登录凭据
   * @returns {Promise} 登录结果
   */
  async login(credentials) {
    try {
      // 检查云开发是否已初始化
      if (!wx.cloud || !wx.cloud.database) {
        throw new Error('云开发未初始化，请稍后重试');
      }
      
      // 这里应该调用后端登录接口
      // 模拟登录过程
      const loginData = {
        username: credentials.username,
        password: credentials.password
      };

      // 调用云函数进行用户认证
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          username: credentials.username,
          password: credentials.password
        }
      });
      
      if (result.result.success) {
        const user = result.result.user;
        const token = result.result.token;
        
        // 保存会话
        sessionManager.saveSession(user, token);
        this.currentUser = user;
        
        return {
          success: true,
          user: user,
          token: token
        };
      } else {
        throw new Error(result.result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw new Error(error.message || '登录失败，请检查用户名和密码');
    }
  }

  /**
   * 用户登出
   */
  logout() {
    sessionManager.clearSession();
    this.currentUser = null;
  }

  /**
   * 获取当前用户
   * @returns {object|null} 当前用户信息
   */
  getCurrentUser() {
    if (!this.currentUser) {
      const session = sessionManager.getSession();
      this.currentUser = session.userInfo;
    }
    return this.currentUser;
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return sessionManager.isSessionValid();
  }

  /**
   * 获取认证头信息
   * @returns {object} 认证头信息
   */
  getAuthHeaders() {
    const token = sessionManager.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 自动登录（从本地存储恢复会话）
   * @returns {boolean} 是否自动登录成功
   */
  autoLogin() {
    if (sessionManager.isSessionValid()) {
      const session = sessionManager.getSession();
      this.currentUser = session.userInfo;
      return true;
    }
    return false;
  }

  /**
   * 更新用户信息
   * @param {object} userData - 更新的用户数据
   * @returns {Promise} 更新结果
   */
  async updateUser(userData) {
    try {
      // 调用云函数更新用户信息
      const result = await wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          userData: userData
        }
      });
      
      if (result.result.success) {
        const updatedUser = result.result.user;
        sessionManager.saveSession(updatedUser, sessionManager.getAuthToken());
        this.currentUser = updatedUser;
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(result.result.message || '更新失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw new Error(error.message || '更新失败，请重试');
    }
  }
}

// 创建单例实例
const authService = new AuthService();

module.exports = authService;