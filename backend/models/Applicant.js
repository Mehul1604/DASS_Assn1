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
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    num_rates: {
        type: Number,
        default: 0,
        min: 0,
        validate : {
            validator : Number.isInteger,
            message   : 'Should be integer'
          }
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