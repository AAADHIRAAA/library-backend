const mongoose = require('mongoose');
const startup = require('./utils/startup');
// Replace the connection string with your MongoDB Atlas connection string
const atlasConnectionString = 'mongodb+srv://padmapriyas:Padma2023atlas@library-cluster.rhvnbwa.mongodb.net/librarydb';

mongoose.connect(atlasConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});
await startup.performStartUp();