// 云函数：初始化数据
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口
exports.main = async (event, context) => {
  const { action } = event;

  try {
    switch (action) {
      case 'initMeditationTypes':
        return await initMeditationTypes();
      case 'initDemoUser':
        return await initDemoUser();
      case 'initAll':
        const [result1, result2] = await Promise.all([
          initMeditationTypes(),
          initDemoUser()
        ]);
        return {
          success: result1.success && result2.success,
          meditationTypes: result1,
          demoUser: result2
        };
      default:
        return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
    return { success: false, message: '初始化数据失败' };
  }
};

/**
 * 初始化冥想类型数据
 */
const initMeditationTypes = async () => {
  try {
    // 检查是否已有数据
    const existingTypes = await db.collection('meditation_types').count();

    if (existingTypes.total === 0) {
      const types = [
        {
          name: '呼吸冥想',
          description: '专注于呼吸，平静心灵',
          duration: 10,
          icon: '🌬️',
          category: '基础'
        },
        {
          name: '正念冥想',
          description: '觉察当下，接纳一切',
          duration: 15,
          icon: '🧘',
          category: '基础'
        },
        {
          name: '身体扫描',
          description: '放松身体每个部位',
          duration: 20,
          icon: '🔍',
          category: '放松'
        },
        {
          name: '慈心冥想',
          description: '培养慈悲心和爱心',
          duration: 15,
          icon: '❤️',
          category: '情感'
        },
        {
          name: '睡眠冥想',
          description: '帮助入睡，提高睡眠质量',
          duration: 25,
          icon: '🌙',
          category: '睡眠'
        }
      ];

      for (const type of types) {
        await db.collection('meditation_types').add({
          data: {
            ...type,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
      }

      return { success: true, message: '冥想类型数据初始化完成' };
    }
    return { success: true, message: '冥想类型数据已存在' };
  } catch (error) {
    console.error('初始化冥想类型数据失败:', error);
    return { success: false, message: '初始化冥想类型数据失败' };
  }
};

/**
 * 初始化默认用户数据（演示用）
 */
const initDemoUser = async () => {
  try {
    // 检查是否已有演示用户
    const existingUsers = await db.collection('users').where({
      username: 'demo'
    }).count();

    if (existingUsers.total === 0) {
      await db.collection('users').add({
        data: {
          username: 'demo',
          nickname: '演示用户',
          email: 'demo@example.com',
          avatar: '/assets/tabbar/profile.png',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });

      return { success: true, message: '演示用户数据初始化完成' };
    }
    return { success: true, message: '演示用户数据已存在' };
  } catch (error) {
    console.error('初始化演示用户数据失败:', error);
    return { success: false, message: '初始化演示用户数据失败' };
  }
};
