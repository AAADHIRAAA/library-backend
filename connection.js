const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

const atlasConnectionString = process.env.MONGODB_CONNECTION_URL;

mongoose.connect(atlasConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open',  () => {
  console.log('Connected to MongoDB Atlas');
  const startup = require('./utils/startup');
  startup.performStartUp();
});
