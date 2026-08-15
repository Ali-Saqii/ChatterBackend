require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();
const path = require("path")

const authRoutes = require('./routes/auth.routes');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === "development") {
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
};
console.log("Current NODE_ENV:", process.env.NODE_ENV)



const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
