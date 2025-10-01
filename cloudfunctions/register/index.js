const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const crypto = require('crypto')

/**
 * 生成随机盐值
 * @returns {string} 随机盐值
 */
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * 密码加密（使用更简单的加密方法确保兼容性）
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 加密后的密码
 */
const encryptPassword = (password, salt) => {
  // 使用更简单的加密方法确保云函数环境兼容性
  return crypto.createHash('sha256').update(password + salt).digest('hex');
};

/**
 * 验证密码
 * @param {string} password - 待验证的密码
 * @param {string} hashedPassword - 加密后的密码
 * @param {string} salt - 盐值
 * @returns {boolean} 是否匹配
 */
const verifyPassword = (password, hashedPassword, salt) => {
  const newHashedPassword = encryptPassword(password, salt);
  return newHashedPassword === hashedPassword;
};

/**
 * 用户注册云函数
 * 包含幂等判断，防止重复注册（支持openID、用户名、邮箱的唯一性检查）
 */
exports.main = async (event, context) => {
  const { username, password, email, nickname, openid } = event;
  
  console.log('register event:', event);

  try {
    // 参数验证
    if (!username || !password) {
      return {
        code: 400,
        message: '用户名和密码不能为空'
      };
    }

    // 检查用户名是否已存在
    const existingUsername = await db.collection('users').where({
      username: username
    }).get()
    
    if (existingUsername.data.length > 0) {
      return {
        code: 409,
        message: '该用户名已注册'
      };
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await db.collection('users').where({
        email: email
      }).get()
      
      if (existingEmail.data.length > 0) {
        return {
          code: 409,
          message: '该邮箱已注册'
        };
      }
    }

    // 如果提供了openid，检查openid是否已存在
    if (openid) {
      const existingOpenid = await db.collection('users').where({
        openid: openid
      }).get()
      
      if (existingOpenid.data.length > 0) {
        return {
          code: 409,
          message: '该微信账号已注册'
        };
      }
    }

    // 生成盐值和加密密码
    const salt = generateSalt();
    const hashedPassword = encryptPassword(password, salt);
    
    // 创建用户数据
    const userData = {
      username: username,
      email: email || '',
      password: hashedPassword,
      salt: salt,
      nickname: nickname || username,
      avatar: '/assets/avatar.png',
      openid: openid || '',
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      lastLoginTime: db.serverDate()
    };

    // 插入用户数据
    const result = await db.collection('users').add({
      data: userData
    });

    // 返回用户信息（不包含敏感信息）
    return {
      code: 201,
      data: {
        _id: result._id,
        username: userData.username,
        nickname: userData.nickname,
        email: userData.email,
        avatarUrl: userData.avatar,
        openid: userData.openid
      },
      message: '注册成功'
    };
  } catch (error) {
    console.error('注册失败:', error);
    
    // 处理数据库唯一索引冲突
    if (error.errCode === -502006) {
      return {
        code: 409,
        message: '该账号已注册'
      };
    }
    
    return {
      code: 500,
      message: '注册失败，请稍后重试'
    };
  }
};