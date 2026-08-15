require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();
const path = require("path")



app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

if (process.env.NODE_ENV === "development") {
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
};
console.log("Current NODE_ENV:", process.env.NODE_ENV)



const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
