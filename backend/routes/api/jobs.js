const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')

//Job Model
const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter')
const Applicant = require('../../models/Applicant')
const Application = require('../../models/Application')

// @route GET api/jobs/rec
// @desc  Get jobs for recruiter
// @access Private

router.get('/rec' , auth , async (req,res) =>{

    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }
    const activeJobs = await Job.find({recruiter_id: req.user.id , state: 'active'})
    return res.json(activeJobs)
});

// @route GET api/jobs/app
// @desc  Get jobs for applicant
// @access Private

router.get('/app' , auth , async (req,res) =>{
    const applicant = await Applicant.findById(req.user.id)
    if(!applicant){
        return res.status(400).json({msg: 'Only Applicant endpoint!'})
    }
    var cur_date = new Date();
    // console.log('JOBS BEFORE' , cur_date) 
    // console.log(cur_date)
    const availableJobs = await Job.find({deadline: {$gt: cur_date}}).populate('application_ids recruiter_id')
    return res.json(availableJobs)
});

// @route POST api/jobs
// @desc  Add a Job
// @access Private

router.post('/' , auth , async (req,res) =>{
    
    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }

    const {title , max_app , max_pos , deadline , req_skills , jobType , duration , salary} = req.body
    const newJob = new Job({
        title ,
        max_app ,
        max_pos ,
        deadline ,
        req_skills ,
        jobType ,
        duration ,
        salary,
        recruiter_id: req.user.id
    })
    try{
        const savedJob = await newJob.save()
        await Recruiter.findByIdAndUpdate(req.user.id , {$push : {job_ids : savedJob._id}} , {new : true})
        return res.json({savedJob})
    }
    catch(err){
        return res.status(500).json(err.message)
    }
    // res.json({who: recruiterPosting.name , wants: newJob})
});

// @route PUT api/jobs
// @desc  Edit a Job
// @access Private 

router.put('/:id' , auth , async (req,res) =>{

    const jobToChange = await Job.findById(req.params.id)
    if(!jobToChange){
        return res.status(400).json({msg: 'Job doesnt exist'})
    }

    const newValues = req.body
    if(newValues.max_app){
        jobToChange.max_app = newValues.max_app
    }
    if(newValues.max_pos){
        jobToChange.max_pos = newValues.max_pos
    }
    if(newValues.deadline){
        jobToChange.deadline = newValues.deadline
    }

    if(jobToChange.pos == jobToChange.max_pos){
        jobToChange.state = 'posFilled'
        const applicationsHaveToReject = await Application.find({job_id: jobToChange.job_id , stage: {$in: ['applied','shortlisted']}})
        for(i=0; i<applicationsHaveToReject.length; i++){
            var appl = applicationsHaveToReject[i]
            console.log('currently rejecting..')
            console.log(appl)
            appl.stage = 'rejected'
            await appl.save()
            console.log('appl rejected')
            await Applicant.findByIdAndUpdate(appl.applicant_id , {$inc: {num_applications: -1}})
            await Job.findByIdAndUpdate(appl.job_id , {$inc: {app: -1} , $set: {state: 'active'}})
            console.log('appl ke job and applicant updated')  

        }

    }
    else if(jobToChange.app == jobToChange.max_app){
        jobToChange.state = 'appFilled'
    }
    

    try{
        const updatedJob = await jobToChange.save()
        
        return res.json({updatedJob})
    }
    catch(err){
        return res.status(500).json(err.message)
    }
    // res.json({who: recruiterPosting.name , wants: newJob})
});

// @route DELETE api/jobs
// @desc  DELETE a Job
// @access Private

router.delete('/:id' , auth, async (req,res) =>{
    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }
    const jobToBeDeleted = await Job.findById(req.params.id)
    if(!jobToBeDeleted){
        return res.status(400).json({msg: 'Job doesnt exist'})
    }
    const job_id = jobToBeDeleted._id
    
    const application_ids = jobToBeDeleted.application_ids
    const applicationsToBeDeleted = await Application.find({_id: {$in: application_ids}})
    console.log('Related applications recieved')
    console.log(application_ids)
    console.log(applicationsToBeDeleted)
    // const applicant_ids = applicationsToBeDeleted.map(app => app.applicant_id)
    // applicant_ids = Array.from(new Set(applicant_ids))
    

    try{
        await jobToBeDeleted.remove()
        await Application.deleteMany({_id: {$in: application_ids}})

        console.log('Deletes from job and application performed')

        const rec = await Recruiter.findByIdAndUpdate(req.user.id , {$pull : {job_ids : job_id} , $pull: {employees : {job_id: job_id}}} , {new : true})
        console.log('Job id and employees pulled from Recruiter')
        console.log(application_ids.length)
        
        await Recruiter.findByIdAndUpdate(req.user.id , {$pullAll : {application_ids : application_ids}} , {new : true})
        
        console.log('Applications removed from Recruiter')
        for(i = 0 ; i<applicationsToBeDeleted.length; i++){
            var appl = applicationsToBeDeleted[i]
            if(appl.stage === 'applied' || appl.stage === 'shortlisted'){
                await Applicant.findByIdAndUpdate(appl.applicant_id , {$pull: {application_ids: appl._id} , $inc: {num_applications: -1}} , {new: true})
            }
            else{
                await Applicant.findByIdAndUpdate(appl.applicant_id , {$pull: {application_ids: appl._id} , $set: {state: 'active'}} , {new: true})
            }
        }
        
        console.log('Recruiter and applicant tables updated')
        return res.json({msg: 'Successful'})
 
    }
    catch(err){
        return res.status(500).json(err.message)
    }
    // Job.findById(req.params.id)
    //     .then(job => job.remove().then(() => res.json({success : true})))
    //     .catch(err => res.status(404).json({success : false}))
});

module.exports = router