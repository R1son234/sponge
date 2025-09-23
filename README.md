# Sponge 冥想助手小程序

## 项目简介

Sponge 是一款专注于冥想练习的微信小程序，旨在帮助用户通过日常冥想练习来放松身心、提高专注力和减轻压力。通过简洁直观的界面设计和丰富的冥想功能，用户可以轻松养成冥想习惯，记录自己的冥想旅程。

## 功能特点

- **多样化冥想课程**：提供不同时长和主题的冥想课程，满足用户的各种需求
- **打卡记录**：记录每日冥想情况，支持连续打卡统计
- **社交互动**：查看好友的冥想动态，互相鼓励，共同进步
- **数据统计**：可视化展示冥想数据，帮助用户了解自己的冥想习惯和进步
- **成就系统**：完成特定任务获得成就徽章，增强用户的成就感和持续动力

## 技术栈

- 前端：微信小程序原生开发框架
- 后端：微信云开发（CloudBase）
- 数据库：云数据库
- 存储：云存储

## 项目结构

```
├── .claude/              # Claude 配置文件
├── CLAUDE.md             # Claude 使用说明
├── README.md             # 项目说明文档
├── app.js                # 应用入口文件
├── app.json              # 应用全局配置
├── app.wxss              # 应用全局样式
├── assets/               # 静态资源文件
│   └── tabbar/           # 底部导航栏图标
├── cloudfunctions/       # 云函数目录
│   ├── addMeditationRecord/       # 添加冥想记录
│   ├── calculateContinuousDays/   # 计算连续打卡天数
│   ├── deleteMeditationRecord/    # 删除冥想记录
│   ├── getFile/                   # 获取文件
│   ├── getFriendMeditationFeed/   # 获取好友冥想动态
│   ├── getMeditationRecords/      # 获取冥想记录
│   ├── updateAchievements/        # 更新成就
│   ├── updateMeditationRecord/    # 更新冥想记录
│   └── uploadFile/                # 上传文件
├── pages/                # 页面文件目录
│   ├── checkin/          # 打卡页面
│   ├── friends/          # 好友页面
│   ├── home/             # 首页
│   ├── login/            # 登录页面
│   ├── meditation/       # 冥想页面
│   └── profile/          # 个人资料页面
├── project.config.json   # 项目配置文件
├── project.private.config.json  # 私有配置文件
└── utils/                # 工具函数目录
    ├── api.js            # API请求工具
    ├── authService.js    # 认证服务
    ├── cryptoUtils.js    # 加密工具
    └── sessionManager.js # 会话管理
```

## 主要页面功能

### 首页（Home）
- 显示用户冥想统计数据
- 提供快速冥想选项（5分钟、10分钟、20分钟）
- 展示推荐的冥想内容

### 冥想页（Meditation）
- 提供多种冥想类型选择
- 支持开始、暂停、结束冥想会话
- 记录冥想时长

### 打卡页（Checkin）
- 展示用户连续打卡天数
- 提供每日打卡功能
- 显示打卡日历

### 好友页（Friends）
- 展示好友列表
- 查看好友的冥想动态
- 支持添加好友功能

### 个人资料页（Profile）
- 展示用户个人信息
- 显示用户的冥想成就
- 提供设置选项

## 云函数说明

项目使用微信云开发功能，通过云函数处理后端逻辑。主要云函数包括：

- **addMeditationRecord**：添加新的冥想记录
- **calculateContinuousDays**：计算用户的连续冥想天数
- **getMeditationRecords**：获取用户的冥想记录列表
- **updateAchievements**：根据用户行为更新成就信息
- **getFriendMeditationFeed**：获取好友的冥想动态

## 快速开始

### 前提条件

- 已安装微信开发者工具
- 已注册微信小程序账号并开通云开发功能

### 开发步骤

1. 克隆项目代码到本地
2. 使用微信开发者工具导入项目
3. 配置云开发环境
4. 部署云函数
5. 在开发者工具中编译运行项目

## API 说明

项目使用统一的API请求工具，封装在 `utils/api.js` 文件中，提供了GET、POST等HTTP请求方法。

### 基础API结构

```javascript
// 统一的网络请求方法
const request = (url, options = {}) => {
  // 实现网络请求逻辑
};

// 各模块API
const meditationAPI = {
  getStats: (userId) => get('/api/meditation/stats', { userId }),
  // 其他方法...
};
```

## 注意事项

- 需要将 `app.js` 中的 `baseURL` 配置为实际的API地址
- 部分功能需要用户授权登录后才能使用
- 云函数需要部署到微信云开发环境
- 确保项目的 `project.config.json` 中的配置与实际开发环境匹配

## 开发团队

本项目由冥想爱好者团队开发，致力于通过技术手段帮助更多人体验冥想的益处，养成健康的生活习惯。

## 更新日志

### 版本 1.0.0
- 初始版本发布
- 实现基础冥想功能
- 支持打卡记录
- 添加好友互动功能
- 实现数据统计与成就系统