require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Test Connection SUCCESS!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test Connection FAILED!');
    console.error(err);
    process.exit(1);
  });
