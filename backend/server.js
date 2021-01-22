const express = require('express')
const mongoose = require('mongoose')
// const bodyParser = require('body-parser')
const config = require('config')
const path = require('path')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const app = express()
app.use(express.json());

const jobs = require('./routes/api/jobs');
const applicants = require('./routes/api/applicants')
const app_auth = require('./routes/api/auth_applicants')
const recruiters = require('./routes/api/recruiters')
const rec_auth = require('./routes/api/auth_recruiters')
const applications = require('./routes/api/applications')
const Applicant = require('./models/Applicant')
const Recruiter = require('./models/Recruiter')
const auth = require('./middleware/auth')
const Job = require('./models/Job')

const db = config.get('mongoURI')

console.log('DB Connecting..')
console.log(db)
mongoose.connect(db , { useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log(err))


app.post('/api/tokenValid' , async (req,res) => {

    
    try{
        const token = req.header('x-auth-token')
        if(!token){
            return res.json(false)
        }
        // console.log('Ok token exists')
        const decoded = jwt.verify(token , config.get('jwtSecret'))
        // console.log(decoded)
        if(!decoded) return res.json(false)

        // console.log('Ok token got decoded also')

        var appl = await Applicant.findById(decoded.id)
        var recr = await Recruiter.findById(decoded.id)

        if(!appl && !recr) return res.json(false)

        return res.json(true)
        
    }
    catch(err){
        res.json(false)
    }
})

app.get('/api/user' , auth , async (req, res) => {
    
    try {
        var appl = await Applicant.findById(req.user.id)
        var recr = await Recruiter.findById(req.user.id)

        if(appl){
            return res.json({
                id: appl._id,
                name: appl.name,
                email: appl.email,
                type: 'Applicant'
            })
        }
        else if(recr){
            return res.json({
                id: recr.id,
                name: recr.name,
                email: recr.email,
                type: 'Recruiter'
            })
        }
    } catch (err) {
        res.status(500).json(err.message)
    }
})

app.post('/api/sendMail' , auth ,  async (req,res) => {

    const recruiter = await Recruiter.findById(req.user.id)
    if(!recruiter){
        return res.status(400).json({msg: 'Only Recruiter endpoint!'})
    }
    

    const {recruiterName , applicationId} = req.body 
    try{
        const applicationAccepted = await Application.findById(applicationId)
        // console.log(applicationAccepted)
        const jobJoined = await Job.findById(applicationAccepted.job_id)
        const jobName = jobJoined.title
        const applicantJoined = await Applicant.findById(applicationAccepted.applicant_id)
        const applicantEmail = applicantJoined.email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: "jobmart1234@gmail.com",
                pass: "dassjobmart1234"
            }
        })
        
        
        const info = await transporter.sendMail({
            from: "jobmart1234@gmail.com",
            to: `${applicantEmail}`,
            subject: "JobMart Application Accepted",
            html: `<b>${recruiterName} has accepted you for the job ${jobName}. Congratulations , hope you enjoyed the service at Job Mart</b>`
        })

        
        console.log(info.response)
        res.json(info.response)
    }
    catch(err){
        res.status(500).json({msg: err.message})
    }
    

})

app.use('/api/jobs' , jobs)
app.use('/api/applicants' , applicants)
app.use('/api/auth/app' , app_auth)
app.use('/api/recruiters' , recruiters)
app.use('/api/auth/rec' , rec_auth)
app.use('/api/applications' , applications)
    
const port = process.env.PORT || 5000;

app.listen(port , () => console.log(`Server started on port ${port}`));