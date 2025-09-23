// 文件上传云函数（处理图片/音频存储）
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const fs = require('fs')
const path = require('path')

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID
  const { tempFilePath, fileType } = event

  // 1. 身份验证
  if (!user_id) return { code: -1, msg: '未登录' }

  // 2. 校验文件类型
  const allowedTypes = ['image', 'audio']
  if (!allowedTypes.includes(fileType)) {
    return { code: -1, msg: `不支持的文件类型：${fileType}` }
  }

  try {
    // 3. 生成唯一文件名（避免重复）
    const timestamp = Date.now()
    const extname = path.extname(tempFilePath)
    const fileName = `${user_id}_${timestamp}${extname}`
    const cloudPath = `${fileType}/${fileName}`

    // 4. 上传文件到云存储（处理大文件）
    const uploadResult = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: fs.createReadStream(tempFilePath), // 使用流处理大文件
      config: { env: wxContext.ENV }
    })

    // 5. 记录文件元数据到数据库
    await db.collection('files').add({
      data: {
        user_id: user_id,
        file_id: uploadResult.fileID,
        file_type: fileType,
        file_path: cloudPath,
        file_size: fs.statSync(tempFilePath).size,
        created_at: db.serverDate()
      }
    })

    // 6. 返回文件访问链接（临时链接，有效期2小时）
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })

    return {
      code: 0,
      msg: '上传成功',
      data: {
        fileID: uploadResult.fileID,
        downloadUrl: downloadUrl.fileList[0].tempFileURL,
        cloudPath: cloudPath
      }
    }
  } catch (err) {
    console.error('文件上传失败:', err)
    return { code: -1, msg: '上传失败' }
  }
}