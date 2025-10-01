const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const cryptoUtils = require('./cryptoUtils')

exports.main = async (event, context) => {
  const { username, password, openid } = event;
  
  try {
    // 构建查询条件：支持用户名或openid登录
    let queryCondition = {};
    
    if (openid) {
      // 优先使用openid登录
      queryCondition.openid = openid;
    } else if (username) {
      // 使用用户名登录
      queryCondition.username = username;
    } else {
      return {
        code: 400,
        message: '请输入用户名或使用微信授权登录'
      };
    }
    
    // 查询用户信息
    const users = await db.collection('users').where(queryCondition).get()
    
    if (users.data.length === 0) {
      return {
        code: 401,
        message: '用户名或密码错误'
      };
    }
    
    const user = users.data[0];
    
    // 如果是用户名密码登录，需要验证密码
    if (username && password) {
      const isPasswordValid = cryptoUtils.verifyPassword(password, user.password, user.salt);
      if (!isPasswordValid) {
        return {
          code: 401,
          message: '用户名或密码错误'
        };
      }
    }
    
    // 更新最后登录时间
    await db.collection('users').doc(user._id).update({
      data: {
        lastLoginTime: db.serverDate()
      }
    });
    
    // 登录成功，返回用户信息
    return {
      code: 200,
      data: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        avatarUrl: user.avatar || '/assets/avatar.png',
        openid: user.openid || ''
      },
      message: '登录成功'
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      code: 500,
      message: '登录失败，请稍后重试'
    };
  }
};
