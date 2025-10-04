// 完成冥想并更新成就云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 成就类型定义
const ACHIEVEMENT_TYPES = {
  FIRST_MEDITATION: 'first_meditation', // 首次冥想
  MEDITATION_STREAK_7: 'meditation_streak_7', // 连续冥想7天
  MEDITATION_STREAK_30: 'meditation_streak_30', // 连续冥想30天
  TOTAL_DURATION_60: 'total_duration_60', // 累计冥想60分钟
  TOTAL_DURATION_300: 'total_duration_300', // 累计冥想300分钟
  TOTAL_SESSIONS_10: 'total_sessions_10', // 完成10次冥想
  TOTAL_SESSIONS_50: 'total_sessions_50', // 完成50次冥想
}

/**
 * 检查当前连续冥想天数（从最新记录开始计算）
 * @param {Array} records - 冥想记录数组（按时间倒序排列）
 * @returns {number} 当前连续天数
 */
const checkConsecutiveDays = (records) => {
  if (records.length === 0) return 0
  
  // 记录已经按时间倒序排列，从最新记录开始计算
  let consecutiveDays = 1
  let currentDate = new Date(records[0].start_time)
  
  // 重置时间为当天开始，避免时间差异影响
  currentDate.setHours(0, 0, 0, 0)
  
  for (let i = 1; i < records.length; i++) {
    const recordDate = new Date(records[i].start_time)
    recordDate.setHours(0, 0, 0, 0)
    
    const diffTime = currentDate - recordDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      // 连续一天
      consecutiveDays++
      currentDate = recordDate
    } else if (diffDays === 0) {
      // 同一天有多次冥想，不增加天数但继续检查
      continue
    } else {
      // 中断连续
      break
    }
  }
  
  return consecutiveDays
}

/**
 * 检查成就条件
 * @param {Array} records - 冥想记录数组
 * @param {Object} newRecord - 新添加的冥想记录
 * @returns {Array} 完成的成就类型数组
 */
const checkAchievements = (records, newRecord) => {
  const achievements = []
  const totalRecords = records.length
  const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0)
  const consecutiveDays = checkConsecutiveDays(records)
  
  // 首次冥想成就
  if (totalRecords === 1) {
    achievements.push(ACHIEVEMENT_TYPES.FIRST_MEDITATION)
  }
  
  // 连续冥想成就
  if (consecutiveDays >= 7) {
    achievements.push(ACHIEVEMENT_TYPES.MEDITATION_STREAK_7)
  }
  if (consecutiveDays >= 30) {
    achievements.push(ACHIEVEMENT_TYPES.MEDITATION_STREAK_30)
  }
  
  // 累计时长成就
  if (totalDuration >= 60) {
    achievements.push(ACHIEVEMENT_TYPES.TOTAL_DURATION_60)
  }
  if (totalDuration >= 300) {
    achievements.push(ACHIEVEMENT_TYPES.TOTAL_DURATION_300)
  }
  
  // 累计次数成就
  if (totalRecords >= 10) {
    achievements.push(ACHIEVEMENT_TYPES.TOTAL_SESSIONS_10)
  }
  if (totalRecords >= 50) {
    achievements.push(ACHIEVEMENT_TYPES.TOTAL_SESSIONS_50)
  }
  
  return achievements
}

/**
 * 更新用户成就记录（只添加用户尚未获得的成就）
 * @param {string} userId - 用户ID
 * @param {Array} newAchievements - 新完成的成就类型数组
 * @returns {Promise} 更新结果
 */
const updateUserAchievements = async (userId, newAchievements) => {
  if (newAchievements.length === 0) return { updated: false, newAchievements: [] }
  
  try {
    // 检查是否已有成就记录
    const existingAchievements = await db.collection('achievements')
      .where({ user_id: userId })
      .get()
    
    let actuallyNewAchievements = []
    
    if (existingAchievements.data.length === 0) {
      // 创建新的成就记录
      const achievementData = {
        user_id: userId,
        achievements: newAchievements.map(type => ({
          type,
          achieved_at: db.serverDate(),
          is_new: true
        })),
        create_time: db.serverDate(),
        update_time: db.serverDate()
      }
      
      await db.collection('achievements').add({
        data: achievementData
      })
      actuallyNewAchievements = newAchievements
    } else {
      // 更新现有成就记录 - 只添加用户尚未获得的成就
      const existingRecord = existingAchievements.data[0]
      const currentAchievementTypes = existingRecord.achievements.map(a => a.type)
      
      actuallyNewAchievements = newAchievements.filter(type => 
        !currentAchievementTypes.includes(type)
      )
      
      if (actuallyNewAchievements.length > 0) {
        const achievementsToAdd = actuallyNewAchievements.map(type => ({
          type,
          achieved_at: db.serverDate(),
          is_new: true
        }))
        
        await db.collection('achievements').doc(existingRecord._id).update({
          data: {
            achievements: _.push(achievementsToAdd),
            update_time: db.serverDate()
          }
        })
      }
    }
    
    return { 
      updated: actuallyNewAchievements.length > 0, 
      newAchievements: actuallyNewAchievements 
    }
  } catch (error) {
    console.error('更新成就记录失败:', error)
    return { updated: false, error, newAchievements: [] }
  }
}

exports.main = async (event, context) => {
  const { duration, meditation_type, notes, start_time } = event
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID
  
  // 参数验证
  if (!duration || !start_time) {
    return {
      code: 400,
      message: '冥想时长和开始时间为必填项'
    }
  }
  
  try {
    // 1. 创建新的冥想记录
    const newRecord = {
      user_id,
      duration: parseInt(duration),
      meditation_type: meditation_type || 'general',
      notes: notes || '',
      start_time: new Date(start_time),
      end_time: db.serverDate(),
      create_time: db.serverDate(),
      update_time: db.serverDate()
    }
    
    const recordResult = await db.collection('meditation_records').add({
      data: newRecord
    })
    
    // 2. 获取用户所有冥想记录（用于成就判断）
    const allRecords = await db.collection('meditation_records')
      .where({ user_id })
      .orderBy('start_time', 'desc')
      .get()
    
    const recordsWithNew = [
      { ...newRecord, _id: recordResult._id },
      ...allRecords.data
    ]
    
    // 3. 检查成就条件
    const completedAchievements = checkAchievements(recordsWithNew, newRecord)
    
    // 4. 更新成就记录
    const achievementResult = await updateUserAchievements(user_id, completedAchievements)
    
    return {
      code: 200,
      message: '冥想记录保存成功',
      data: {
        record_id: recordResult._id,
        new_achievements: achievementResult.newAchievements || [],
        total_sessions: recordsWithNew.length,
        consecutive_days: checkConsecutiveDays(recordsWithNew)
      }
    }
    
  } catch (error) {
    console.error('完成冥想失败:', error)
    return {
      code: 500,
      message: '保存冥想记录失败，请稍后重试'
    }
  }
}