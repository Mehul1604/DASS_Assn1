const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

const jobs = require('./routes/api/jobs');

const db = require('./config/keys').mongoURI;

console.log('DB Connecting..')
console.log(db)
mongoose.connect(db , { useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log(err))


app.use('/api/jobs' , jobs)
    
const port = process.env.PORT || 5000;

app.listen(port , () => console.log(`Server started on port ${port}`));