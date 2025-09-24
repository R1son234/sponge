// 新增冥想会话记录云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { user_id, type, duration, start_time, end_time, status } = event
  const wxContext = cloud.getWXContext()

  // 数据校验
  if (!user_id || user_id !== wxContext.OPENID) {
    return { code: -1, msg: '用户身份验证失败' }
  }
  if (!type || !duration || !start_time || !end_time || !status) {
    return { code: -1, msg: '缺少必要参数' }
  }
  if (duration <= 0) {
    return { code: -1, msg: '时长必须为正数' }
  }

  try {
    await db.collection('meditation_records').add({
      data: {
        user_id: user_id,
        type: type,
        duration: duration,
        start_time: db.serverDate({ date: start_time }),
        end_time: db.serverDate({ date: end_time }),
        status: status,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
    return { code: 0, msg: '新增成功' }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '新增失败' }
  }
}