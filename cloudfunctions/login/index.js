const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const cryptoUtils = require('./cryptoUtils')

exports.main = async (event, context) => {
  const { username, password } = event;
  
  try {
    // 查询用户信息
    const users = await db.collection('users').where({
      username: username
    }).get()
    
    if (users.data.length === 0) {
      return {
        code: 401,
        message: '用户名或密码错误'
      };
    }
    
    const user = users.data[0];
    
    // 验证密码
    const hashedPassword = cryptoUtils.encryptPassword(password, user.salt);
    if (hashedPassword !== user.password) {
      return {
        code: 401,
        message: '用户名或密码错误'
      };
    }
    
    // 登录成功，返回用户信息
    return {
      code: 200,
      data: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        avatarUrl: user.avatar || '/assets/avatar.png'
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
