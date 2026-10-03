require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/db');
const { validateEnvironment } = require('./config/env');
const { initiliseSocket } = require('./sockets/socket');
const { generalRateLimiter } = require('./middleware/rateLimit.middleware');
const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const errorMiddleware = require('./middleware/error.middleware');

validateEnvironment();

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
app.use(cors());


app.use("/api", generalRateLimiter);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// api routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const friendRoutes = require('./routes/friend.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const conversationRoutes = require('./routes/conversation.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

const httpServer = http.createServer(app);

const io = initiliseSocket(httpServer);
app.set('io', io);

app.use('/api/conversation', conversationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use(errorMiddleware);

const startServer = async () => {
  await db.connectDb();
  const PORT = process.env.PORT || 5001;
  return httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, io, startServer };
