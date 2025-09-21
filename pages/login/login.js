// pages/login/login.js
const authService = require('../../utils/authService');
const app = getApp();

Page({
  data: {
    loginType: 'login', // login 或 register
    formData: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      nickname: ''
    },
    loading: false,
    error: null
  },

  onLoad() {
    // 如果已登录，跳转到首页
    if (authService.isLoggedIn()) {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },

  // 切换登录/注册类型
  switchType() {
    this.setData({
      loginType: this.data.loginType === 'login' ? 'register' : 'login',
      error: null
    });
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value,
      error: null
    });
  },

  // 提交表单
  async onSubmit() {
    const { loginType, formData } = this.data;

    // 表单验证
    if (!this.validateForm()) {
      return;
    }

    this.setData({ loading: true, error: null });

    try {
      if (loginType === 'login') {
        await this.handleLogin();
      } else {
        await this.handleRegister();
      }
    } catch (error) {
      this.setData({ 
        error: error.message,
        loading: false 
      });
    }
  },

  // 表单验证
  validateForm() {
    const { loginType, formData } = this.data;

    if (!formData.username.trim()) {
      this.setData({ error: '请输入用户名' });
      return false;
    }

    if (!formData.password.trim()) {
      this.setData({ error: '请输入密码' });
      return false;
    }

    if (loginType === 'register') {
      if (formData.password.length < 6) {
        this.setData({ error: '密码长度至少6位' });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        this.setData({ error: '两次输入的密码不一致' });
        return false;
      }

      if (formData.email && !this.validateEmail(formData.email)) {
        this.setData({ error: '请输入有效的邮箱地址' });
        return false;
      }
    }

    return true;
  },

  // 邮箱验证
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 处理登录
  async handleLogin() {
    const { username, password } = this.data.formData;

    try {
      const result = await authService.login({ username, password });
      
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);
      }
    } catch (error) {
      throw error;
    } finally {
      this.setData({ loading: false });
    }
  },

  // 处理注册
  async handleRegister() {
    const { username, password, email, nickname } = this.data.formData;

    try {
      const result = await authService.register({
        username,
        password,
        email,
        nickname
      });

      if (result.success) {
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        });

        // 自动登录后跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);
      }
    } catch (error) {
      throw error;
    } finally {
      this.setData({ loading: false });
    }
  },

  // 快速访客登录（演示用）
  onQuickLogin() {
    this.setData({
      formData: {
        username: 'demo',
        password: '123456'
      }
    });
    this.onSubmit();
  }
});