require('dotenv').config()
const jwt = require('jsonwebtoken');
const User = require('./models/user')

module.exports = async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.jwtPayload = decoded;
    req.user = await User.findById(decoded.userID)
    if (!req.user) {
      return res.send({
        response: {},
        errors: [{
          code: 'failed_to_find_user',
          message: 'ユーザーの取得に失敗しました。'
        }]
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      response: {},
      errors: [{
        code: 'not_authenticated',
        message: 'アクセスする権限がありません。'
      }]
    });
  }
};
