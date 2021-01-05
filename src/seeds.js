require('dotenv').config()

const mongoose = require('mongoose');
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

const User = require('./models/user')
const Work = require('./models/work')

const user = new User({
  email: 'test@test.test',
  password: 'test',
  votedCount: 0
})
user.save()

const work1 = new Work({
  workId: '1',
  workName: 'sample1',
  votedCount: 0,
})
work1.save()

const work2 = new Work({
  workId: '2',
  workName: 'sample2',
  votedCount: 0,
})
work2.save()
