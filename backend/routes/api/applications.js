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
    // res.json({who: recruiterPosting.name , wants: newJob})
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
    const applicationToBeUpdated = await Application.findById(req.params.app_id)
    applicationToBeUpdated.stage = stage
    try{
        const updatedApplication = await applicationToBeUpdated.save()
        console.log('Application stage changed')
        if(updatedApplication.stage === 'rejected'){
            console.log('rejected if condition')
            await Applicant.findByIdAndUpdate(updatedApplication.applicant_id , {$inc: {num_applications: -1}})
            await Job.findByIdAndUpdate(updatedApplication.job_id , {$inc: {app: -1} , $set: {state: 'active'}})
            console.log('decreases from job and applicant')
        }
        else{
            if(updatedApplication.stage === 'accepted'){
                console.log('accepted if condition')
                await Application.findByIdAndUpdate(updatedApplication._id , {$set: {date_join: Date.now()}})
                console.log('date of joining done')
                const applicationsToReject = await Application.find({applicant_id: updatedApplication.applicant_id , stage: {$in: ['applied','shortlisted']}})
                console.log('applications to reject found')
                console.log(applicationsToReject)
                for(i=0; i<applicationsToReject.length; i++){
                    var appl = applicationsToReject[i]
                    console.log('currently rejecting..')
                    console.log(appl)
                    appl.stage = 'rejected'
                    await appl.save()
                    console.log('appl rejected')
                    await Applicant.findByIdAndUpdate(appl.applicant_id , {$inc: {num_applications: -1}})
                    await Job.findByIdAndUpdate(appl.job_id , {$inc: {app: -1} , $set: {state: 'active'}})
                    console.log('appl ke job and applicant updated')  

                }

                console.log('other applications rejected')

                
                await Recruiter.findByIdAndUpdate(updatedApplication.recruiter_id , {$push: {employees: updatedApplication._id}})
                await Applicant.findByIdAndUpdate(updatedApplication.applicant_id , {$set: {state: 'gotJob'} , $inc: {num_applications: -1}})
                jobToJoin = await Job.findById(updatedApplication.job_id)
                if(jobToJoin.pos == jobToJoin.max_pos){
                    return res.status(400).json({msg: 'Maximum number of positions for job!'})
                }

                const updatedJob = await Job.findByIdAndUpdate(updatedApplication.job_id , {$inc: {pos: 1 , app: -1}} , {new : true})
                console.log('JOB POSITIONS ARE NOW' , updatedJob.pos , 'MAX POSITIONS ARE' , updatedJob.max_pos)
                if(updatedJob.pos == updatedJob.max_pos){
                    await Job.findByIdAndUpdate(updatedApplication.job_id , {$set: {state: 'posFilled'}} , {new : true})
                    const applicationsHaveToReject = await Application.find({job_id: updatedApplication.job_id , stage: {$in: ['applied','shortlisted']}})
                    for(i=0; i<applicationsHaveToReject.length; i++){
                        var appl = applicationsHaveToReject[i]
                        console.log('currently rejecting..')
                        console.log(appl)
                        appl.stage = 'rejected'
                        await appl.save()
                        console.log('appl rejected')
                        await Applicant.findByIdAndUpdate(appl.applicant_id , {$inc: {num_applications: -1}})
                        await Job.findByIdAndUpdate(appl.job_id , {$inc: {app: -1}})
                        console.log('appl ke job and applicant updated')  
    
                    }

                }
                else{
                    await Job.findByIdAndUpdate(updatedApplication.job_id , {$set: {state: 'active'}})
                }

                

                console.log('employee added to recruiter')
            }
        }

        return res.json(updatedApplication)
    }
    catch(err){
        res.status(500).json(err.message)
    }

});


module.exports = router