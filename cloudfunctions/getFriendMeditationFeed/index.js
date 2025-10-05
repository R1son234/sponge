// 获取好友冥想动态Feed云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

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

    // 获取用户好友列表（已通过的好友）
    const friendships = await db.collection('friendships')
      .where({
        user_id: user_id,
        status: 'accepted'
      })
      .field({ friend_id: true })
      .get()

    const friendIds = friendships.data.map(item => item.friend_id)
    if (friendIds.length === 0) {
      return { code: 0, data: { total: 0, list: [] } }
    }

    // 获取好友的冥想记录（按时间降序排列）
    const total = await db.collection('meditation_records')
      .where({ user_id: _.in(friendIds) })
      .count()

    const feed = await db.collection('meditation_records')
      .where({ user_id: _.in(friendIds) })
      .field({
        user_id: true,
        type: true,
        duration: true,
        start_time: true,
        created_at: true
      })
      .orderBy('start_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 关联用户信息（昵称、头像）
    const userInfo = await db.collection('users')
      .where({ _id: _.in(friendIds) })
      .field({ nickname: true, avatarUrl: true })
      .get()

    // 合并数据
    const result = feed.data.map(record => {
      const user = userInfo.data.find(u => u._id === record.user_id)
      return {
        ...record,
        user: {
          nickname: user ? user.nickname : '未知用户',
          avatarUrl: user ? user.avatarUrl : ''
        }
      }
    })

    return {
      code: 0,
      data: {
        total: total.total,
        list: result
      }
    }
  } catch (err) {
    console.error(err)
    return { code: -1, msg: '获取动态失败' }
  }
}