const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    }
});

module.exports = Job =  mongoose.model('job' , JobSchema)