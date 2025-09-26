// cloudfunctions/login/cryptoUtils.js - 密码加密工具（云函数版本）
const crypto = require('crypto');

/**
 * 生成随机盐值
 * @returns {string} 随机盐值
 */
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * 密码加密
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 加密后的密码
 */
const encryptPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
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