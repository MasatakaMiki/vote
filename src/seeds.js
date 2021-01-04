require('dotenv').config()

const mongoose = require('mongoose');

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


const User = require('./models/user')
const Work = require('./models/work')

const user = new User({
  email: 'test@test.test',
  password: 'test',
  hasVoted: 0
})
user.save()

const work1 = new Work({
  title: '作品１ すごい作品',
  votes: 0,
})
work1.save()

const work2 = new Work({
  title: '作品2 美しい作品',
  votes: 0,
})
work2.save()

const work3 = new Work({
  title: '作品3 面白い作品',
  votes: 0,
})
work3.save()