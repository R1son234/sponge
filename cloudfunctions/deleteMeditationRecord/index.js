// 删除冥想会话记录云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  const wxContext = cloud.getWXContext()

  // 数据校验
  if (!id) {
    return { code: -1, msg: '缺少记录ID' }
  }

  try {
    // 检查记录是否属于当前用户
    const record = await db.collection('meditation_records').doc(id).get()
    if (record.data.user_id !== wxContext.OPENID) {
      return { code: -1, msg: '无权限删除该记录' }
    }

    await db.collection('meditation_records').doc(id).remove()
    return { code: 0, msg: '删除成功' }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '删除失败' }
  }
}