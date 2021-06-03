const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')


const Applicant = require('../../models/Applicant');

// @route POST api/auth/app
// @desc  Authenticate Applicant
// @access Public

router.post('/' , (req,res) =>{
    const {email , password} = req.body

    if(!email || !password){
        res.status(400).json({msg : 'Please enter all fields'})
    }
    

    Applicant.findOne({email})
        .then(applicant =>{
            if(!applicant) return res.status(400).json({msg : 'User does not exist'})

            //Validate Password
            bcrypt.compare(password , applicant.password)
                .then(isMatch => {
                    if(!isMatch) return res.status(400).json({msg:'Incorrect Credentials'})

                    jwt.sign(
                        {id : applicant.id , type: 'Applicant'},
                        config.get('jwtSecret'),
                        (err , token) => {
                            if(err) throw err

                            res.json({token , user : {
                                id : applicant.id,
                                name : applicant.name,
                                email : applicant.email,
                                type: 'Applicant'
                            }})
                        }
                    )
                })
        })
})

// @route GET api/auth/app/user
// @desc  Get user data
// @access Private
 
router.get('/user' , auth , (req,res) =>{
    Applicant.findById(req.user.id).populate({
        path: 'application_ids',
        populate: {
            path: 'job_id'
        }
    })
        .select('-password')
        .then(applicant => {
            if(!applicant) return res.status(400).json({msg: 'User does not exist'})
            else return res.json(applicant)
        }) 
})



module.exports = router