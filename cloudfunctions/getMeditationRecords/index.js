// 获取冥想会话记录列表云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10 } = event
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID

  try {
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