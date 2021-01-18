const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
    date_of_app: {
        type: Date,
        default: Date.now
    },
    date_join: {
        type: Date,
    },
    sop : {
        type : String,
        required : true
    },
    stage: {
        type: String,
        enum: ['applied' , 'shortlisted' , 'accepted' , 'rejected'],
        default: 'applied'
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobs'
    },
    applicant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'applicants'
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiters'
    }

});

module.exports = Application =  mongoose.model('applications' , ApplicationSchema)