const cloud = require('wx-server-sdk')
const db = cloud.database()

exports.main = async (event) => {
  const { username, currentUsername } = event;
  
  try {
    // 参数验证
    if (!username) {
      return {
        code: 400,
        msg: '用户名不能为空'
      };
    }
    
    if (!currentUsername) {
      return {
        code: 400,
        msg: '当前用户信息缺失'
      };
    }
    
    // 检查是否添加自己
    if (username === currentUsername) {
      return {
        code: 400,
        msg: '不能添加自己为好友'
      };
    }
    
    // 检查目标用户是否存在
    const targetUser = await db.collection('users').where({ username: username }).get()
    if (targetUser.data.length === 0) {
      return {
        code: 404,
        msg: '用户不存在'
      };
    }
    
    // 检查是否已经发送过申请
    const existingRequest = await db.collection('add_friend_records')
      .where({
        applicant: currentUsername,
        targetUser: username,
        status: 'pending'
      })
      .get()
    
    if (existingRequest.data.length > 0) {
      return {
        code: 400,
        msg: '已经向该用户发送过好友申请'
      };
    }
    
    // 创建好友申请记录
    const now = new Date()
    const result = await db.collection('add_friend_records').add({
      data: {
        applicant: currentUsername, // 申请人
        targetUser: username,       // 被申请人
        applyTime: now,            // 申请时间
        status: 'pending',         // 状态：pending/approved/rejected
        acceptTime: null,          // 接受时间
        createTime: now,
        updateTime: now
      }
    })
    
    return {
      code: 200,
      msg: '好友申请已发送',
      data: {
        recordId: result._id
      }
    }
  } catch (err) {
    console.error('发送好友申请失败:', err)
    return {
      code: 500,
      msg: '服务器错误'
    }
  }
}