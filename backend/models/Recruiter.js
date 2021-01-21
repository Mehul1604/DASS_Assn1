const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RecruiterSchema = new Schema({
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
    contact: {
        type: Number,
        validate: {
            validator: function(v){
                return /^\d{10}$/.test(v);
            },
            message: 'Invalid contact number'
        },
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    profile_img: {
        type: String,
        default: ""
    },
    employees: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'applications'
            }
        ],
        default: []
    },
    job_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'jobs',
            default: []
        }
    ],
    application_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'applications',
            default: []
        }
    ]

});

module.exports = Recruiter =  mongoose.model('recruiters' , RecruiterSchema)