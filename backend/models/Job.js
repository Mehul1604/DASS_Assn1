const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    app: {
        type: Number,
        min: 0,
        default: 0,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }

    },
    pos: {
        type: Number,
        min: 0,
        default: 0,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }

    }, 
    max_app : {
        type : Number,
        required: true,
        min: 1,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
    },
    max_pos: {
        type: Number,
        required: true,
        min: 1,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
    },
    date_post: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        required:true
    },
    req_skills: {
        type: [String],
        default: []
    },
    jobType: {
        type: String,
        enum: ['F' , 'P' , 'H'],
        required: true
    },
    duration: {
        type: Number,
        default: 0,
        min: 0,
        max: 6,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
    },
    salary:{
        type: Number,
        required: true,
        min: 0,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
    },
    ratings: {
        type: [
            {
                app_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'applicants',
                    required: true
                },
                rate: {
                    type: Number,
                    min: 0,
                    max: 5,
                    validate: {
                        validator: Number.isInteger,
                        message: 'Should be Integer'
                    }
                }
            }
        ],
        default: []
    },
    state: {
        type: String,
        enum: ['posFilled' , 'appFilled' , 'active'],
        default: 'active'
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiters'
    },
    application_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'applications',
            default: []
        }
    ]

});

module.exports = Job =  mongoose.model('jobs' , JobSchema)