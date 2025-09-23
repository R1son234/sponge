// 计算连续打卡天数云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID

  try {
    // 获取用户所有冥想记录（按日期降序排列）
    const records = await db.collection('meditation_records')
      .where({ user_id })
      .field({ start_time: true })
      .orderBy('start_time', 'desc')
      .get()

    if (records.data.length === 0) {
      return { code: 0, data: 0 }
    }

    // 提取日期并去重（按天）
    const dateSet = new Set()
    records.data.forEach(record => {
      const date = record.start_time.toDate().toISOString().split('T')[0]
      dateSet.add(date)
    })
    const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a))

    // 计算连续天数
    let continuousDays = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i-1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.abs(prevDate - currDate) / (1000 * 60 * 60 * 24)
      if (diffDays === 1) {
        continuousDays++
      } else {
        break
      }
    }

    return { code: 0, data: continuousDays }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '计算失败' }
  }
}