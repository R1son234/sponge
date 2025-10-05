// 获取冥想会话记录列表云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, username } = event
  const wxContext = cloud.getWXContext()

  if (!username) {
    return { code: -1, msg: '用户名不能为空' }
  }

  try {
    // 基于username查询用户信息
    const userResult = await db.collection('users').where({ username }).get()
    if (userResult.data.length === 0) {
      return { code: -1, msg: '用户不存在' }
    }

    const user_id = userResult.data[0]._id

    const total = await db.collection('meditation_records').where({ user_id }).count()
    const records = await db.collection('meditation_records')
      .where({ user_id })
      .orderBy('start_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      code: 0,
      msg: '获取成功',
      data: {
        total: total.total,
        list: records.data
      }
    }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '获取失败' }
  }
}