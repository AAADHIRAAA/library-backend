const mongoose = require('mongoose');
const atlasConnectionString = 'mongodb+srv://access_user:access_user@library-cluster.rhvnbwa.mongodb.net/librarydb';

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
