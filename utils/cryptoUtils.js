// utils/cryptoUtils.js - 密码加密工具（简化版，用于演示）
/**
 * 生成随机盐值
 * @returns {string} 随机盐值
 */
const generateSalt = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * 密码加密（简化版，实际项目中应使用更安全的加密方式）
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 加密后的密码
 */
const encryptPassword = (password, salt) => {
  // 简化的加密逻辑，实际项目应使用更安全的算法
  const combined = password + salt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * 验证密码
 * @param {string} password - 待验证的密码
 * @param {string} hashedPassword - 加密后的密码
 * @param {string} salt - 盐值
 * @returns {boolean} 是否匹配
 */
const verifyPassword = (password, hashedPassword, salt) => {
  const newHashedPassword = encryptPassword(password, salt);
  return newHashedPassword === hashedPassword;
};

module.exports = {
  generateSalt,
  encryptPassword,
  verifyPassword
};