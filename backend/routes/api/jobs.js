const express = require('express')
const router = express.Router();

//Item Model
const Job = require('../../models/Job');

// @route GET api/jobs
// @desc  Get All Jobs
// @access Public

router.get('/' , (req,res) =>{
    Job.find()
        .then(items => res.json(items))
})

// @route POST api/jobs
// @desc  Add Job
// @access Public

router.post('/' , (req,res) =>{
    const newJob = new Job({
        name : req.body.name
    });
    newJob.save().then(jobs => res.json(jobs)).catch(err => console.log(err));
});

// @route DELETE api/jobs
// @desc  DELETE an Job
// @access Public

router.delete('/:id' , (req,res) =>{
    Job.findById(req.params.id)
        .then(job => job.remove().then(() => res.json({success : true})))
        .catch(err => res.status(404).json({success : false}))
});

module.exports = router