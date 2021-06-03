const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')

const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter')
const Applicant = require('../../models/Applicant')
const Application = require('../../models/Application')



// @route POST api/applications
// @desc  Add an application
// @access Private

router.post('/' , auth , async (req,res) =>{
    
    const applicant = await Applicant.findById(req.user.id)
    if(!applicant){
        return res.status(400).json({msg: 'Only Applicant endpoint!'})
    }

    if(applicant.num_applications == 10){
        return res.status(400).json({msg: 'Maximum number of applications for applicant!'})
    }

    const {sop , job_id , recruiter_id} = req.body
    jobToApply = await Job.findById(job_id)
    if(jobToApply.pos == jobToApply.max_pos){
        return res.status(400).json({msg: 'Maximum number of positions for job!'})
    }
    
    if(jobToApply.app == jobToApply.max_app){
        return res.status(400).json({msg: 'Maximum number of applications for job!'})
    }
    const newApplication = new Application({
        sop,
        applicant_id: req.user.id,
        job_id,
        recruiter_id
    })
    try{
        const savedApplication = await newApplication.save()
        await Applicant.findByIdAndUpdate(req.user.id , {$push : {application_ids : savedApplication._id} , $inc: {num_applications: 1} }  , {new : true})
        await Recruiter.findByIdAndUpdate(recruiter_id , {$push : {application_ids : savedApplication._id}} , {new : true})
        const updatedJob = await Job.findByIdAndUpdate(job_id , {$push : {application_ids : savedApplication._id} , $inc: {app: 1}} , {new : true})
        if(updatedJob.app == updatedJob.max_app){
            await Job.findByIdAndUpdate(job_id , {$set: {state: 'appFilled'}} , {new : true})
        }
        return res.json({savedApplication})
    }
    catch(err){
        return res.status(500).json(err.message)
    }
    
});

// // @route GET api/applications/app
// // @desc  my applications
// // @access Private

router.get('/app' , auth , async (req,res) =>{

    const applicant = await Applicant.findById(req.user.id)
    if(!applicant){
        return res.status(400).json({msg: 'Only Applicant endpoint!'})
    }

    const allApplications = await Application.find({applicant_id: req.user.id}).populate('job_id recruiter_id')
    return res.json(allApplications)

});

//  @route GET api/applications/rec/:job_id
//  @desc  applications of a job by recruiter
//  @access Private

router.get('/rec/:job_id' , auth , async (req,res) =>{

    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }

    const allApplications = await Application.find({job_id: req.params.job_id , stage: {$in : ['applied' , 'shortlisted' , 'accepted']}}).populate('applicant_id')
    return res.json(allApplications)

});

// @route PUT api/applications/:app_id
// @desc  accept/reject/shortlist an application
// @access Private



router.put('/:app_id' , auth , async (req,res) =>{

    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }
    const {stage} = req.body
    try {
        if(stage === 'shortlisted'){
            const updatedApplication = await Application.findByIdAndUpdate(req.params.app_id , {$set: {stage: stage}} , {new: true})
            return res.json(updatedApplication)
        }
        else if(stage === 'rejected'){
            console.log('REJECTION')
            const updatedApplication = await Application.findByIdAndUpdate(req.params.app_id , {$set : {stage: stage}} , {new: true})
            await Applicant.findByIdAndUpdate(updatedApplication.applicant_id , {$inc: {num_applications : -1}})
            const updatedJob = await Job.findByIdAndUpdate(updatedApplication.job_id , {$inc: {app: -1}} , {new: true})
            console.log(updatedJob.app , updatedJob.max_app , updatedJob.pos , updatedJob.max_pos)
            if(updatedJob.app < updatedJob.max_app && updatedJob.pos < updatedJob.max_pos){
                console.log('job is active again')
                await Job.findByIdAndUpdate(updatedApplication.job_id , {$set : {state: 'active'}})
            }

            return res.json(updatedApplication)
        }
        else if(stage === 'accepted'){
            const updatedApplication = await Application.findByIdAndUpdate(req.params.app_id , {$set : {stage: stage , date_join: Date.now()}} , {new: true})
            const applicantJoined = await Applicant.findByIdAndUpdate(updatedApplication.applicant_id , {$set: {state: 'gotJob' , num_applications: 0}} , {new: true})
            await Recruiter.findByIdAndUpdate(updatedApplication.recruiter_id , {$push: {employees: updatedApplication._id}})
            const joinedJob = await Job.findByIdAndUpdate(updatedApplication.job_id , {$inc: {pos: 1 , app: -1}} , {new: true})
            const applicationFilter = ['applied' , 'shortlisted']
            const otherApplicantApplications = await Application.find({applicant_id: applicantJoined._id , stage: {$in: applicationFilter}})
            const otherApplicantApplicationIds = otherApplicantApplications.map(appl => appl._id)
            const otherApplicantApplicationJobIds = otherApplicantApplications.map(appl => appl.job_id)
            await Application.updateMany({_id: {$in: otherApplicantApplicationIds}} , {$set: {stage: 'rejected'}})
            await Job.updateMany({_id: {$in : otherApplicantApplicationJobIds}} , {$inc: {app: -1} , $set: {state: 'active'}})
            if(joinedJob.pos === joinedJob.max_pos){
                const inactiveJob = await Job.findByIdAndUpdate(joinedJob._id , {$set: {state: 'posFilled'}} , {new: true})
                const otherJobApplications = await Application.find({job_id: inactiveJob._id , stage: {$in: applicationFilter}})
                const num_to_reject = -1 * otherJobApplications.length
                await Job.findByIdAndUpdate(inactiveJob._id , {$inc: {app: num_to_reject}})
                const otherJobApplicationIds = otherJobApplications.map(appl => appl._id)
                const otherJobApplicantIds = otherJobApplications.map(appl => appl.applicant_id)
                await Application.updateMany({_id: {$in: otherJobApplicationIds}} , {$set: {stage: 'rejected'}})
                await Applicant.updateMany({_id: {$in: otherJobApplicantIds}} , {$inc: {num_applications: -1}})
            }
            else{
                await Job.findByIdAndUpdate(joinedJob._id , {$set: {state: 'active'}})
            }

            return res.json(updatedApplication)

        }
    } catch (err) {
        res.status(500).json(err.message)
    }
    

});


module.exports = router