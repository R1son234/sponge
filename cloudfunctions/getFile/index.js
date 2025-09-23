// 获取文件云函数（支持图片/音频访问）
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID
  const { fileID } = event

  // 1. 校验文件存在性
  const file = await db.collection('files').where({ file_id: fileID }).get()
  if (file.data.length === 0) {
    return { code: -1, msg: '文件不存在' }
  }

  // 2. 权限验证（示例：仅上传者可访问）
  if (file.data[0].user_id !== user_id) {
    return { code: -1, msg: '无权限访问' }
  }

  try {
    // 3. 获取临时下载链接（有效期2小时）
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [fileID]
    })

    return {
      code: 0,
      msg: '获取成功',
      data: {
        downloadUrl: downloadUrl.fileList[0].tempFileURL
      }
    }
  } catch (err) {
    console.error('文件获取失败:', err)
    return { code: -1, msg: '获取失败' }
  }
}