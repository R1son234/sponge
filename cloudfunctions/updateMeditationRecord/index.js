// 更新冥想会话记录云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { id, status, end_time } = event
  const wxContext = cloud.getWXContext()

  // 数据校验
  if (!id) {
    return { code: -1, msg: '缺少记录ID' }
  }
  if (!status && !end_time) {
    return { code: -1, msg: '缺少更新参数' }
  }

  try {
    // 检查记录是否属于当前用户
    const record = await db.collection('meditation_records').doc(id).get()
    if (record.data.user_id !== wxContext.OPENID) {
      return { code: -1, msg: '无权限修改该记录' }
    }

    const updateData = {}
    if (status) updateData.status = status
    if (end_time) updateData.end_time = db.serverDate({ date: end_time })
    updateData.updated_at = db.serverDate()

    await db.collection('meditation_records').doc(id).update({
      data: updateData
    })
    return { code: 0, msg: '更新成功' }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '更新失败' }
  }
}