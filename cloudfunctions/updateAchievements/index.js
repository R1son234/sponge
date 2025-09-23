// 更新成就记录云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID

  try {
    // 1. 获取用户冥想数据统计
    const [totalCountRes, totalDurationRes, continuousDaysRes] = await Promise.all([
      db.collection('meditation_records').where({ user_id }).count(),
      db.collection('meditation_records').where({ user_id }).aggregate()
        .group({ _id: null, total: _.sum('duration') })
        .end(),
      cloud.callFunction({ name: 'calculateContinuousDays', data: { user_id } })
    ])

    const totalCount = totalCountRes.total
    const totalDuration = totalDurationRes.list[0]?.total || 0
    const continuousDays = continuousDaysRes.result.data

    // 2. 定义成就条件映射
    const achievementConditions = {
      1: { condition: totalCount >= 1, name: '初心者' },    // 完成第一次冥想
      2: { condition: totalDuration >= 100, name: '专注达人' }, // 累计100分钟
      3: { condition: continuousDays >= 7, name: '坚持者' },   // 连续7天
      4: { condition: totalCount >= 30, name: '冥想达人' }     // 总次数30次
    }

    // 3. 批量更新成就状态
    for (const [achievementId, config] of Object.entries(achievementConditions)) {
      const { condition, name } = config
      const status = condition ? 'achieved' : 'not_achieved'

      // 检查当前成就状态
      const existing = await db.collection('achievement_record')
        .where({ user_id, achievement_id: parseInt(achievementId) })
        .get()

      if (existing.data.length === 0) {
        // 新增成就记录
        await db.collection('achievement_record').add({
          data: {
            user_id,
            achievement_id: parseInt(achievementId),
            name,
            status,
            created_at: db.serverDate(),
            updated_at: db.serverDate()
          }
        })
      } else if (existing.data[0].status !== status) {
        // 更新状态变化的成就
        await db.collection('achievement_record').where({
          _id: existing.data[0]._id
        }).update({
          data: { status, updated_at: db.serverDate() }
        })
      }
    }

    return { code: 0, msg: '成就更新成功' }
  } catch (err) {
    console.error('成就更新失败:', err)
    return { code: -1, msg: '成就更新失败' }
  }
}