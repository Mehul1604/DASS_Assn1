const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')

//Recruiter Model
const Recruiter = require('../../models/Recruiter');
const Applicant = require('../../models/Applicant');

// @route GET api/recruiters
// @desc  Get All Recruiters
// @access Public

router.get('/' , (req,res) =>{
    Recruiter.find()
        .then(recruiters => res.json(recruiters))
})

// @route POST /api/recruiters
// @desc Register a recruiter
// @access Public

router.post('/' , (req,res) =>{

    const {name , email , password ,contact , bio} = req.body

    if(!name || !email || !password){
        return res.status(400).json({msg: 'Please fill all the fields'})
    }

    Applicant.findOne({email})
        .then(app =>{
            if(app){
                return res.status(400).json({msg: 'You are already an applicant'})
            }
        })

    Recruiter.findOne({email})
        .then(recruiter =>{
            if(recruiter){
                return res.status(400).json({msg: 'User already exists'})
            }

            const newRecruiter = new Recruiter({
                name,
                email,
                password,
                contact,
                bio
            });

            bcrypt.genSalt(10 , (err,salt) =>{
                bcrypt.hash(newRecruiter.password , salt , (err,hash) =>{
                    if(err) throw err
                    newRecruiter.password = hash
                    newRecruiter.save()
                        .then(recruiter =>{
                            jwt.sign(
                                {id: recruiter.id , type: 'Recruiter'},
                                config.get('jwtSecret'),
                                (err , token) =>{
                                    if(err) throw err

                                    res.json({
                                        token,
                                        user: {
                                            id: recruiter.id,
                                            name: recruiter.name,
                                            email: recruiter.email,
                                            type: 'Recruiter'
                                        }
                                    })
                                }
                            )
                        })
                        .catch(err => res.status(500).json(err.message))
                })
            })
        })
    
    // newApplicant.save().then(applicant => res.json(applicant)).catch(err => console.log(err));
});

// @route POST api/recruiters/profile
// @desc  EDIT recruiter profile
// @access Private

router.post('/profile' , auth, async (req,res) =>{
    const newValues = req.body
    const recruiterToChange = await Recruiter.findById(req.user.id)
    if(newValues.name){
        recruiterToChange.name = newValues.name
    }

    if(newValues.contact){        
        recruiterToChange.contact = newValues.contact
    }
    if(newValues.bio === null || newValues.bio === undefined){
        recruiterToChange.bio = newValues.bio
    }

    try{
        const updatedRecruiter = await recruiterToChange.save()
        res.json(updatedRecruiter)
    }
    catch(err){
        res.status(500).json(err.message)
    }
    
});

// @route GET api/recruiters/emps
// @desc  get all employees
// @access Private

router.get('/emps' , auth,  async (req,res) =>{
    const recruiter = await Recruiter.findById(req.user.id)
    return res.json(recruiter.employees)
})

// @route PUT api/recruiters/apprate
// @desc  rate an employee
// @access Private

router.put('/apprate/:app_id' , auth, async (req,res) =>{
    const {newRate} = req.body
    const applicantToRate = await Applicant.findById(req.params.app_id)
    if(!applicantToRate){
        return res.status(400).json({msg: 'Applicant doesnt exist'})
    }

    if(applicantToRate.ratings.find(r => {
        if(r.rec_id === req.user.id){
            return true
        }

        return false
    })){
        return res.status(400).json({msg: 'Recruiter has already Rated the Applicant'})
    }

    applicantToRate.ratings.push({
        rec_id: req.user.id,
        rate: newRate
    })

    try{
        const updatedApplicant = await applicantToRate.save()
        res.json(updatedApplicant)
    }
    catch(err){
        res.status(500).json(err.message)
    }
    
});

module.exports = router