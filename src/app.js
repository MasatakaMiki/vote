require('dotenv').config()

const express = require('express');
const helmet = require('helmet'); /* https://expressjs.com/ja/advanced/best-practice-security.html */
const cors = require('cors'); /* Cross-Origin Resource Sharing https://expressjs.com/en/resources/middleware/cors.html */
// const lusca = require('lusca');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt')

const jwt = require("jsonwebtoken");
const authenticate = require('./authenticate');
const User = require('./models/user')
const Work = require('./models/work');
//const e = require('express');

const app = express();

const LIMIT_OF_NUMBER_OF_VOTES = 3;

// app.use(lusca.csrf());
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
const options = {
  useUnifiedTopology : true,
  useNewUrlParser : true
}
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DATABASE}`, options)
  .then(() => { console.log('succeed to connect db.') })

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

app.post('/login', (req, res) => {
  const pass = req.body.password
  const email = req.body.email

  if (!pass) {
    return res.send({
      response: {},
      errors: [{
        code: 'password_not_entered',
        message: 'password is not entered'
      }]
    });
  }

  if (!email) {
    return res.send({
      response: {},
      errors: [{
        code: 'email_not_entered',
        message: 'email address is not entered'
      }]
    });
  }

  User.findOne({email: email}).then(user => {
    if (user) {
      if (bcrypt.compareSync(pass, user.password)) {
        const token = jwt.sign({userID: user.id}, process.env.JWT_SECRET_KEY, {expiresIn: '1d'})
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
            message: 'password is incorrect or the email address cannot be recognized'
          }]
        });
      }
    } else {
      res.send({
        response: {},
        errors: [{
          code: 'password_or_email_is_invalid',
          message: 'password is incorrect or the email address cannot be recognized'
        }]
      });
    }
  }).catch(err => {
    console.error('error: ', err)
    return res.send({
      response: {},
      errors: [{
        code: 'failed_to_find_user',
        message: 'failed to find user'
      }]
    });
  })
})

app.post('/login-test', authenticate, (req, res) => {
  return res.send({
    response: {
      msg: 'succeed to test',
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
      workId: w.workId,
      workName: w.workName,
      votedCount: w.votedCount
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
        code: 'already_has_max_voted',
        message: 'You alreay have ' + LIMIT_OF_NUMBER_OF_VOTES + 'voted'
      }]
    });
  }

  const work = await Work.findById(req.params.id);
  if (!work) {
    return res.send({
      response: {},
      errors: [{
        code: 'failed_to_find_work',
        message: 'failed to find work'
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

const port = process.env.PORT || 3000;
app.listen(port);
console.log('server is listening on port ' + port);
