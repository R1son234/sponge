// 获取冥想类型云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 默认冥想类型数据
const DEFAULT_MEDITATION_TYPES = [
  {
    id: 'breathing',
    name: '呼吸冥想',
    description: '专注于呼吸，平静心灵',
    duration: 10,
    icon: 'breathing',
    difficulty: 'beginner'
  },
  {
    id: 'body_scan',
    name: '身体扫描',
    description: '感受身体各部位的放松',
    duration: 15,
    icon: 'body_scan',
    difficulty: 'beginner'
  },
  {
    id: 'loving_kindness',
    name: '慈心冥想',
    description: '培养对自己和他人的善意',
    duration: 20,
    icon: 'heart',
    difficulty: 'intermediate'
  },
  {
    id: 'mindfulness',
    name: '正念冥想',
    description: '觉察当下，不加评判',
    duration: 15,
    icon: 'mindfulness',
    difficulty: 'intermediate'
  },
  {
    id: 'sleep',
    name: '助眠冥想',
    description: '帮助放松入睡',
    duration: 30,
    icon: 'sleep',
    difficulty: 'beginner'
  },
  {
    id: 'stress_relief',
    name: '减压冥想',
    description: '缓解压力，恢复平静',
    duration: 20,
    icon: 'stress_relief',
    difficulty: 'intermediate'
  }
]

exports.main = async (event, context) => {
  try {
    // 直接返回默认冥想类型数据，不查询数据库
    return {
      code: 200,
      message: '获取冥想类型成功',
      data: DEFAULT_MEDITATION_TYPES
    }
  } catch (error) {
    console.error('获取冥想类型失败:', error)
    return {
      code: 500,
      message: '获取冥想类型失败',
      error: error.message
    }
  }
}