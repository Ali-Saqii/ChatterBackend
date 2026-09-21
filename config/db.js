const mongoose = require('mongoose');
// const config = require('./config');
const dbgr = require('debug')('development:Chatter');

const connectDb = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    dbgr('Connected to MongoDB');
};

module.exports = mongoose.connection;
module.exports.connectDb = connectDb;