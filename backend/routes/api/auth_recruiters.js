const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')
 

const Recruiter = require('../../models/Recruiter');

// @route POST api/auth/rec
// @desc  Authenticate Recruiter
// @access Public

router.post('/' , (req,res) =>{
    const {email , password} = req.body

    if(!email || !password){
        res.status(400).json({msg : 'Please enter all fields'})
    }

    Recruiter.findOne({email})
        .then(recruiter =>{
            if(!recruiter) return res.status(400).json({msg : 'User does not exist'})

            //Validate Password
            bcrypt.compare(password , recruiter.password)
                .then(isMatch => {
                    if(!isMatch) return res.status(400).json({msg:'Incorrect Credentials'})

                    jwt.sign(
                        {id : recruiter.id , type: 'Recruiter'},
                        config.get('jwtSecret'),
                        (err , token) => {
                            if(err) throw err

                            res.json({token , user : {
                                id : recruiter.id,
                                name : recruiter.name,
                                email : recruiter.email,
                                type: 'Recruiter'
                            }})
                        }
                    )
                })
        })
})
 
// @route GET api/auth/rec/user
// @desc  Get user data
// @access Private

router.get('/user' , auth , (req,res) =>{
    Recruiter.findById(req.user.id)
        .select('-password')
        .then(recruiter => {
            if(!recruiter) return res.status(400).json({msg: 'User does not exist'})
            else return res.json(recruiter)
        })
})



module.exports = router