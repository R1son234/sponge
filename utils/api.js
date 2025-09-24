// utils/api.js - 云开发数据库操作工具函数
// 注意：调用此文件中的函数前，必须确保已经调用 wx.cloud.init()
let db = null;

// 延迟初始化数据库连接
const getDB = () => {
  if (!db) {
    db = wx.cloud.database();
  }
  return db;
};

/**
 * 统一的数据库查询方法
 * @param {string} collection - 集合名称
 * @param {object} condition - 查询条件
 * @returns {Promise} Promise对象
 */
const query = (collection, condition = {}) => {
  return new Promise((resolve, reject) => {
    getDB().collection(collection).where(condition).get({
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        console.error('数据库查询失败:', error);
        reject(error);
      }
    });
  });
};

/**
 * 添加数据
 * @param {string} collection - 集合名称
 * @param {object} data - 要添加的数据
 * @returns {Promise} Promise对象
 */
const add = (collection, data) => {
  return new Promise((resolve, reject) => {
    getDB().collection(collection).add({
      data: {
        ...data,
        createTime: getDB().serverDate(),
        updateTime: getDB().serverDate()
      },
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('数据库添加失败:', error);
        reject(error);
      }
    });
  });
};

/**
 * 更新数据
 * @param {string} collection - 集合名称
 * @param {string} id - 文档ID
 * @param {object} data - 要更新的数据
 * @returns {Promise} Promise对象
 */
const update = (collection, id, data) => {
  return new Promise((resolve, reject) => {
    getDB().collection(collection).doc(id).update({
      data: {
        ...data,
        updateTime: getDB().serverDate()
      },
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('数据库更新失败:', error);
        reject(error);
      }
    });
  });
};

/**
 * 删除数据
 * @param {string} collection - 集合名称
 * @param {string} id - 文档ID
 * @returns {Promise} Promise对象
 */
const remove = (collection, id) => {
  return new Promise((resolve, reject) => {
    getDB().collection(collection).doc(id).remove({
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('数据库删除失败:', error);
        reject(error);
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {object} params - 查询参数
 * @returns {Promise} Promise对象
 */
const get = (url, params = {}) => {
  return request(url, { method: 'GET', data: params });
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const post = (url, data = {}) => {
  return request(url, { method: 'POST', data });
};

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const put = (url, data = {}) => {
  return request(url, { method: 'PUT', data });
};

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} Promise对象
 */
const del = (url, data = {}) => {
  return request(url, { method: 'DELETE', data });
};

// 冥想相关API
const meditationAPI = {
  // 获取冥想类型
  getTypes: () => query('meditation_types'),
  
  // 获取冥想记录
  getRecords: (userId) => query('meditation_records', { userId }),
  
  // 获取冥想统计
  getStats: (userId) => {
    return new Promise((resolve, reject) => {
      query('meditation_records', { userId }).then(records => {
        const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0);
        const totalSessions = records.length;
        
        // 计算连续天数（简化版）
        const dates = records.map(r => new Date(r.createTime).toDateString());
        const uniqueDates = [...new Set(dates)];
        const streak = uniqueDates.length;
        
        resolve({
          totalDuration,
          totalSessions,
          streak,
          lastMeditation: records[0] ? new Date(records[0].createTime) : null
        });
      }).catch(reject);
    });
  },
  
  // 记录冥想
  record: (data) => add('meditation_records', data)
};

// 用户相关API
const userAPI = {
  // 获取用户信息
  getUser: (userId) => query('users', { _id: userId }).then(users => users[0]),
  
  // 创建用户
  createUser: (data) => add('users', data)
};

// 好友相关API
const friendsAPI = {
  // 获取好友列表
  getFriends: (userId) => query('friendships', { userId, status: 'accepted' }),
  
  // 获取好友动态
  getActivities: (userId) => {
    return query('friendships', { userId, status: 'accepted' }).then(friendships => {
      const friendIds = friendships.map(f => f.friendId);
      return query('meditation_records', { 
        userId: getDB().command.in(friendIds) 
      }).then(records => {
        return records.map(record => ({
          ...record,
          type: 'meditation'
        }));
      });
    });
  },
  
  // 发送好友请求
  sendRequest: (data) => add('friend_requests', data)
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  meditationAPI,
  userAPI,
  friendsAPI
};