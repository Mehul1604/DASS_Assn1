const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')

//Applicant Model
const Applicant = require('../../models/Applicant');
const Recruiter = require('../../models/Recruiter');

// @route GET api/applicants
// @desc  Get All Applicants
// @access Public

router.get('/' , (req,res) =>{
    Applicant.find()
        .then(applicants => res.json(applicants))
})

// @route POST /api/applicants
// @desc Register an applicant
// @access Public

router.post('/' , (req,res) =>{

    const {name , email , password ,skills} = req.body

    if(!name || !email || !password){
        return res.status(400).json({msg: 'Please fill all the fields'})
    }

    Recruiter.findOne({email})
        .then(rec =>{
            if(rec){
                return res.status(400).json({msg: 'You are already a recruiter'})
            }
        })


    Applicant.findOne({email})
        .then(applicant =>{
            if(applicant){
                return res.status(400).json({msg: 'User already exists'})
            }

            const newApplicant = new Applicant({
                name,
                email,
                password,
                skills
            });

            bcrypt.genSalt(10 , (err,salt) =>{
                bcrypt.hash(newApplicant.password , salt , (err,hash) =>{
                    if(err) throw err
                    newApplicant.password = hash
                    newApplicant.save()
                        .then(applicant =>{
                            jwt.sign(
                                {id: applicant.id , type: 'Applicant'},
                                config.get('jwtSecret'),
                                (err , token) =>{
                                    if(err) throw err

                                    res.json({
                                        token,
                                        user: {
                                            id: applicant.id,
                                            name: applicant.name,
                                            email: applicant.email,
                                            type: 'Applicant'
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

// @route POST api/applicants/profile
// @desc  EDIT applicant profile
// @access Private

router.post('/profile' , auth, async (req,res) =>{
    const newValues = req.body
    const applicantToChange = await Applicant.findById(req.user.id)
    if(newValues.name){
        applicantToChange.name = newValues.name
    }


    if(newValues.skills){
        applicantToChange.skills = newValues.skills
    }
    if(newValues.education){
        applicantToChange.education = newValues.education
    }

    try{
        const updatedApplicant = await applicantToChange.save()
        res.json(updatedApplicant)
    }
    catch(err){
        res.status(500).json(err.message)
    }
    
});

// @route POST api/applicants/imgUpload
// @desc  upload profile pic
// @access Private

router.post('/imgUpload' , auth , async (req,res) => {
    const {base64} = req.body
    console.log('RECIEVED' , base64[0])
    try{
        await Applicant.findByIdAndUpdate(req.user.id , {profile_img : base64})
        res.json({msg: 'success'})
    }
    catch(err){
        res.status(500).json({msg: err.message})
    }
    
})

// @route PUT api/applicants/jobrate
// @desc  rate a job
// @access Private
 
router.put('/jobrate/:job_id' , auth, async (req,res) =>{
    const {newRate} = req.body
    const jobToRate = await Job.findById(req.params.job_id)
    if(!jobToRate){
        return res.status(400).json({msg: 'Job doesnt exist'})
    }

    if(jobToRate.ratings.find(r => {
        if(r.app_id === req.user.id){
            return true
        }

        return false
    })){
        return res.status(400).json({msg: 'Applicant has already Rated the Job'})
    }

    jobToRate.ratings.push({
        app_id: req.user.id,
        rate: newRate
    })

    try{
        const updatedJob = await jobToRate.save()
        res.json(updatedJob)
    }
    catch(err){
        res.status(500).json(err.message)
    }
    
});



module.exports = router