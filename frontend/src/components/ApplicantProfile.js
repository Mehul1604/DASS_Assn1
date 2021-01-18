import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Container , Button, Grid , Paper , TextField , Snackbar} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';
import {generate} from 'shortid'
import Select from 'react-select';

// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

const predefSkills = [
    {
        value: 1,
        label: 'Python'
    },
    {
        value: 2,
        label: 'C++'
    },
    {
        value: 3,
        label: 'Javascript'
    },
    {
        value: 4,
        label: 'MySQL'
    },
    {
        value: 5,
        label: 'TensorFlow'
    },
    {   
        value: 6,
        label: 'C'
    },
    {
        value: 7,
        label: 'Java'
    }
]

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

class ApplicantProfile extends Component {
    
    static contextType = UserContext

    state = {
        name: null,
        email: null,
        applications: null,
        rating: null,
        status: null,
        education: [],
        skills: [],
        work: null,
        loading: true,
        canEditName: false,
        canEditEducation: false,
        canEditSkills: false,
        validOpen: false
    }

    // nameRef = React.createRef()

    componentDidMount(){
        const getApplicant = async (token) => {
            try{
                console.log('making axios now'  )
                const applicant = await axios.get('/api/auth/app/user' , {headers: {'x-auth-token' : token}})
                this.setState({
                    name: applicant.data.name,
                    email: applicant.data.name,
                    applications: applicant.data.num_applications,
                    work: applicant.data.state === 'gotJob' ? applicant.data.application_ids.filter(app => app.stage === 'accepted')[0].job_id.title : null,
                    rating: applicant.data.rating,
                    status: applicant.data.state === 'active' ? 'Unemployed' : 'Employed',
                    education: applicant.data.education.map(appEdu => { return {...appEdu , tempId: generate()}}),
                    skills: applicant.data.skills
                })
            }
            catch(err){
                console.log(err.response.data)
                this.context.logOut()
                this.props.history.push('/')
            }
            finally{
                this.setState({loading:false})
            }
        }
        
        getApplicant(this.context.token)
    }

    onNameChange = (e) =>{
        this.setState({name: e.target.value})
    }

    editName = () =>{
        this.setState({canEditName: true})
    }

    submitName = async () =>{
        this.setState({loading: true})
        console.log('NEW NAME IS' , this.state.name)
        this.setState({canEditName: false})
        const body = {name: this.state.name}
        try{
            const changedNameApplicant = await axios.post('/api/applicants/profile' , body , {headers: {'x-auth-token': this.context.token}})
            this.context.changeName(this.context.token , true , changedNameApplicant.name)
        }
        catch(err){
            console.log(err)
        }
        finally{
            this.setState({loading: false})
        }
        
    }

    editEdu = () =>{
        this.setState({canEditEducation: true})
    }

    eduChange = (e,idx) =>{
        
        const newEdu = this.state.education.map((edu) => {
            if(idx !== edu.tempId) return edu
            return {...edu , [e.target.name]: e.target.value}
        })
        
        this.setState({education: newEdu})
        console.log(this.state.education)
    }

    eduAdd = () => {
        this.setState({
            education: this.state.education.concat([{institution: "" , start_year: '' , end_year: '' , tempId: generate()}])
        })
    }

    eduRemove = (e, idx) => {
        this.setState({
            education: this.state.education.filter((edu) => edu.tempId !== idx)
        })
    }

    eduSubmit = async (e) =>{
        e.preventDefault()
        
        this.setState({canEditEducation: false})
        for(let i=0;i<this.state.education.length;i++){
            var ed = this.state.education[i]
            var sy = Date.parse(ed.start_year)
            var ey = Date.parse(ed.end_year)
            console.log(sy,ey)
            if(ey){
                if(ey < sy){
                    this.setState({
                        validOpen: true
                    })
                    return
                }
                
            }
        }
        this.setState({loading: true})
        const dbEdu = this.state.education.map(edu => {
            const copyEdu = {
                institution: edu.institution,
                start_year: edu.start_year,
                end_year: edu.end_year
            }
            return copyEdu
        })

        console.log(dbEdu)
        const body = {education: dbEdu}
        try{
            await axios.post('/api/applicants/profile' , body , {headers: {'x-auth-token': this.context.token}})
        }
        catch(err){
            console.log(err.response.data)
        }
        finally{
            this.setState({loading: false})
        }
    }

    skillChange = (e) =>{
        this.setState({skills: Array.isArray(e) ? e.map(x => x.label) : []})
        console.log(this.state.skills)
    }

    editSkill = (e) => {
        this.setState({canEditSkills: true})
    }

    skillSubmit = async (e) =>{
        
        this.setState({canEditSkills: false})
        
        this.setState({loading: true})
        
        const body = {skills: this.state.skills}
        try{
            await axios.post('/api/applicants/profile' , body , {headers: {'x-auth-token': this.context.token}})
        }
        catch(err){
            console.log(err.response.data)
        }
        finally{
            this.setState({loading: false})
        }
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({validOpen: false})
      };
    //   onClick={this.editName} style={{marginTop:'1rem' , marginLeft:'1rem'}}
    render() {
        console.log(this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            
            <div className="container" style={{  marginTop:'2rem'}}>
                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="error">
                    End Year should be greater than Start year
                    </Alert>
                </Snackbar>
                  
                <Grid container spacing={5}>
                    <Grid style={{paddingLeft:'2rem' , backgroundColor:'yellow'}} item xs={4}>
                        <Grid style={{border:'2px solid #ADF1B3' , borderRadius:'1rem' ,  backgroundColor:'#80ffe5' }} container direction='column' justify='center' alignItems='flex-start' spacing={3}>
                            <Grid style={{backgroundColor:'pink'}} item>
                                <div>
                                    <h3>Name</h3>
                                    <form onSubmit={this.submitName}>
                                    <TextField required InputProps={{readOnly: !this.state.canEditName}} value={this.state.name} onChange={this.onNameChange}   variant='outlined'/>
                                    {!this.state.canEditName ? (<button key="edit-button" style={{marginTop:'1rem' , marginLeft:'1rem'}} type="button" onClick={this.editName}>Edit</button>) : (<button type="submit"  style={{marginTop:'1rem' , marginLeft:'1rem'}}>Submit</button>)}
                                    </form>
                                </div>
                            </Grid>
                            <Grid  item>
                                <div>
                                <h3>Email</h3>
                                    {this.state.email}
                                </div>
                            </Grid> 
                            <Grid item>
                                <h3>Waiting Job Applications</h3>
                                {this.state.applications}
                            </Grid>
                            <Grid item>
                                <h3>Rating</h3>
                                {this.state.rating}
                            </Grid>
                            <Grid item>
                                <h3>Status</h3>
                                {this.state.status}
                            </Grid>
                            {
                                this.state.work ? (
                                    <Grid item>
                                        <h3>Job</h3>
                                        {this.state.work}
                                    </Grid>
                                ) : (
                                    ''
                                )
                            }
                            
                        </Grid>
                    </Grid>
                    <Grid style={{backgroundColor:'pink'}} item xs={8}>
                        <Grid style={{border:'2px solid #ADF1B3' , borderRadius:'1rem' ,  backgroundColor:'red' }} container direction='column' justify='center'  spacing={3}>
                            <Grid style={{backgroundColor:'pink'}} item>
                                <div>
                                    <h3>Education</h3>
                                    <form onSubmit={this.eduSubmit}>
                                    {this.state.education.length ? this.state.education.map((edu) => (
                                        <div key={edu.tempId}>
                                        <TextField InputProps={{readOnly: !this.state.canEditEducation}} required name='institution' placeholder='Add Institution' value={edu.institution} onChange={(e) => this.eduChange(e,edu.tempId)} variant='outlined'/>
                                        <TextField InputProps={{readOnly: !this.state.canEditEducation}} inputProps={{pattern:'^[12][0-9]{3}$'}} required name='start_year' placeholder='Add Start Year(YYYY)' value ={edu.start_year} onChange={(e) => this.eduChange(e,edu.tempId)} variant='outlined'/>
                                        <TextField InputProps={{readOnly: !this.state.canEditEducation}} name='end_year' placeholder='Add End Year(YYYY)' value={edu.end_year ? edu.end_year : ''} onChange={(e) => this.eduChange(e,edu.tempId)} variant='outlined'/>
                                        {this.state.canEditEducation ? (<button key="edit-education-remove" onClick={(e) => this.eduRemove(e,edu.tempId)}>&times;</button>) : ''}
                                        </div>
                                        
                                    )) : 'Add Education'}
                                    {!this.state.canEditEducation ? (
                                        <button key="edit-button" type="button" onClick={this.editEdu}>Edit</button>
                                    ): (
                                        <>
                                        <button key="edit-education-add" onClick={this.eduAdd}>Add</button>
                                        <button key ="edit-education-submit" type='submit'>Submit</button>
                                        </>
                                    )}
                                    
                                    </form>
                                    
                                </div>
                            </Grid>
                            <Grid style={{backgroundColor:'pink'}} item>
                                <div>
                                    <h3>Skills</h3>
                                    {/* {this.state.skills.length ? this.state.skills.map((skill , idx) => (
                                        <span key={idx}>{skill} </span>
                                    )) : 'Add Skills'} */}
                                    <Select  isDisabled={!this.state.canEditSkills} className="dropdown" placeholder="Select skill" value={predefSkills.filter(obj => this.state.skills.includes(obj.label))} options={predefSkills} onChange={this.skillChange} isMulti/>
                                    {!this.state.canEditSkills ? (<button key="edit-button-skill" style={{marginTop:'1rem' , marginLeft:'1rem'}} type="button" onClick={this.editSkill}>Edit</button>) : (<button onClick={this.skillSubmit}  style={{marginTop:'1rem' , marginLeft:'1rem'}}>Submit</button>)}
                                    
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                
           </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     user: state.auth.user,
//     error: state.error
// })

export default ApplicantProfile