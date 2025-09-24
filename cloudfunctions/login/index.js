exports.main = async (event, context) => {
  const { username, password } = event;
  // 此处模拟登录验证，实际应连接数据库查询
  if (username === 'demo' && password === '123456') {
    return {
      code: 200,
      data: {
        _id: '123',
        username: 'demo',
        nickname: '海绵用户',
        avatarUrl: '/assets/avatar.png'
      },
      message: '登录成功'
    };
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    };
  }
};
