const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  try {
    const user = await db.collection('users').where({ _openid: OPENID }).get()
    if (user.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      }
    }
    return {
      code: 200,
      data: user.data[0]
    }
  } catch (err) {
    console.error('获取用户信息失败:', err.message)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
}