const cloud = require('wx-server-sdk')
const db = cloud.database()

exports.main = async (event) => {
  const { username } = event;
  
  try {
    // 参数验证
    if (!username) {
      return {
        code: 400,
        msg: '用户名不能为空'
      };
    }
    
    // 使用用户名查询用户信息
    const user = await db.collection('users').where({ username: username }).get()
    if (user.data.length === 0) {
      return {
        code: 404,
        msg: '用户不存在'
      }
    }
    return {
      code: 200,
      data: user.data[0]
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      code: 500,
      msg: '服务器错误'
    }
  }
}