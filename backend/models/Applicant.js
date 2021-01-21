const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ApplicantSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required: true,
        unique: true 
    },
    password : {
        type: String,
        required: true
    },
    education : {
        type: [
            {
                institution: {
                    type: String,
                    required: true
                },
                start_year: {
                    type: String,
                    required: true
                },
                end_year: String
            }
        ],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    ratings: {
        type: [
            {
                rec_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'recruiters',
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
    profile_img: {
        type: String,
        default: ""
    },
    num_applications: {
        type:Number,
        max:10,
        default:0,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
    },
    state: {
        type: String,
        enum: ['active' , 'gotJob'],
        default: 'active'
    },
    application_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'applications',
            default: []
        }
    ]

});

module.exports = Applicant =  mongoose.model('applicants' , ApplicantSchema)