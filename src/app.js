require('dotenv').config()

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// const lusca = require('lusca');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const authenticate = require('./authenticate');

const User = require('./models/user')
const Work = require('./models/work');
const e = require('express');

const app = express();

const LIMIT_OF_NUMBER_OF_VOTES = 1;

// app.use(lusca.csrf());
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DB
mongoose.Promise = global.Promise;

const options = {
  useUnifiedTopology : true,
  useNewUrlParser : true
}
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.9eckx.mongodb.net/dcj2020-contest-voting-test?retryWrites=true&w=majority`, options)
  .then(() => { console.log('succeed to connect db.') })

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

// users
app.post('/login', (req, res) => {
  const pass = req.body.password
  const email = req.body.email

  if (!pass) {
    return res.send({
      response: {},
      errors: [{
        code: 'password_is_empty',
        message: 'パスワードが空白です。'
      }]
    });
  }

  if (!email) {
    return res.send({
      response: {},
      errors: [{
        code: 'email_is_empty',
        message: 'メールアドレスが空白です。'
      }]
    });
  }

  User.findOne({email: email}).then(user => {
    if (user) {
      if (bcrypt.compareSync(pass, user.password)) {
        const token = jwt.sign({userID: user.id}, JWT_SECRET_KEY, {expiresIn: '1d'})
        res.send({
          response: {
            jwt: token
          },
          errors: []
        });
      } else {
        res.send({
          response: {},
          errors: [{
            code: 'password_or_email_is_invalid',
            message: 'パスワードかメールアドレスが登録されていないか、間違っています。'
          }]
        });
      }
    } else {
      res.send({
        response: {},
        errors: [{
          code: 'password_or_email_is_invalid',
          message: 'パスワードかメールアドレスが登録されていないか、間違っています。'
        }]
      });
    }
  }).catch(err => {
    console.error('error: ', err)
    return res.send({
      response: {},
      errors: [{
        code: 'failed_to_find_user',
        message: 'ユーザーの取得に失敗しました。'
      }]
    });
  })
})

app.post('/login-test', authenticate, (req, res) => {
  return res.send({
    response: {
      msg: 'テスト成功!',
      userID: req.jwtPayload.userID
    },
    errors: []
  });
})

app.get('/works', async (_req, res) => {
  let works = await Work.find({});
  works = works.map(w => {
    return {
      id: w.id,
      title: w.title,
      votes: w.votes
    }
  })

  return res.send({
    response: {
      works,
    },
    errors: []
  })
})

app.post('/works/:id/vote', authenticate, async (req, res) => {
  if (req.user.hasVotedCount >= LIMIT_OF_NUMBER_OF_VOTES) {
    return res.send({
      response: {},
      errors: [{
        code: 'this_user_has_already_voted',
        message: 'このユーザーは最大数まで投票済みです。'
      }]
    });
  }

  const work = await Work.findById(req.params.id);
  if (!work) {
    return res.send({
      response: {},
      errors: [{
        code: 'failed_to_find_work',
        message: '作品の取得に失敗しました。'
      }]
    })
  } else {
    work.votes += 1;
    await work.save();

    req.user.hasVotedCount += 1;
    await req.user.save();

    return res.send({
      response: {},
      errors: []
    })
  }
})

app.post('/unvoted', authenticate, async (req, res) => {
  req.user.hasVotedCount = 0
  await req.user.save()

  return res.send({
    response: {},
    errors: []
  })
})

// listen
const port = process.env.PORT || 3000;
app.listen(port);
console.log('server is listening on port ' + port);
