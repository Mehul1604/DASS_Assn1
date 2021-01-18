import React, {Component} from 'react';
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {TextField , Container ,Button , MenuItem , Snackbar , InputAdornment} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import PhoneIcon from '@material-ui/icons/Phone';
import InfoIcon from '@material-ui/icons/Info';
import UserContext from '../context/UserContext'

// import {connect} from 'react-redux'
// import {register , setNull , loadUser} from '../actions/authActions'
// import {clearErrors} from '../actions/errorActions'
// import PropTypes from 'prop-types'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }


 
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class Register extends Component {
    
    state = {
        name: '',
        email: '',
        password: '',
        contact: null,
        bio: '',
        type: 'Applicant', 
        validOpen: false,
        errorMsg: ''
    }
    
    static contextType = UserContext

    onChange = (e) =>{
        this.setState({[e.target.name] : e.target.value})
        
    }
    onTypeChange = (e) =>{
        this.setState({[e.target.name] : e.target.value})

        this.setState({
            name: '',
            email: '',
            password:'',
            contact: '',
            bio: '',
            validOpen: false,
            errorMsg: ''
        });
        
    }
    
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({validOpen: false})
      };

    onSubmit = (e) => {
        e.preventDefault();
        const  {name , email , password} = this.state
        console.log(name,email,password)

        var em = false
        var con = false
        var b =  false
        if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)))
        {
            console.log('em true')
            em = true
        }

        if(this.state.type === 'Applicant'){
            console.log('APPLICANT')
            if(em){
                console.log('email invalid')
                this.setState({
                    validOpen: true,
                    errorMsg: 'Invalid Email!'
                });
                return;
            }
            const newApplicant = {
                name,email,password,
            }

            axios.post('/api/applicants' , newApplicant)
            .then(res => {
                this.context.setUser(res.data.token , true , res.data.user)
                localStorage.setItem('token' , res.data.token)
                this.props.history.push('/')
            })
            .catch(err => {
                this.setState({
                    validOpen: true,
                    errorMsg: err.response.data.msg
                })
            })
            // this.props.register(newApplicant , 'Applicant')
            // console.log(this.props.isAuthenticated)
            console.log(newApplicant)

            
        }
        else{
            if(!(/^\d{10}$/.test(this.state.contact))){
                con = true
            }

            if(this.state.bio.split(' ').length > 5){
                b = true
            }
            console.log('RECRUITER')

            if(em || con){
                var msg = ''
                if(em && con){
                    msg = 'Invalid Email and Phone Number!'
                }
                else{
                    if(em){
                        msg = 'Invalid Email!'
                    }
                    else{
                        msg = 'Invalid Phone Number!'
                    }
                }

                this.setState({
                    validOpen: true,
                    errorMsg: msg
                });
                return

            }

            if(b){
                this.setState({
                    validOpen: true,
                    errorMsg: 'Bio too long!'
                });
                return
            }
            const newRecruiter = {
                name,email,password,
                contact: this.state.contact,
                bio: this.state.bio
            }

            // this.props.register(newRecruiter , 'Recruiter')
            console.log(newRecruiter)
            // console.log(this.props.isAuthenticated)
            // console.log('SENDING RECRUITER TO PATH /api/recruiters')
            // console.log(newRecruiter)
            axios.post('/api/recruiters' , newRecruiter)
            .then(res => {
                this.context.setUser(res.data.token , true , res.data.user)
                localStorage.setItem('token' , res.data.token)
                this.props.history.push('/')
            })
            .catch(err => {
                this.setState({
                    validOpen: true,
                    errorMsg: err.response.data.msg
                })
            })

            
        }

        this.setState({
            name: '',
            email: '',
            password:'',
            contact: '',
            bio: '',
            validOpen: false,
            errorMsg: ''
        });
    }

    render() {

        if(this.context.isAuthenticated){
            return <Redirect to ='/' />
        }
        console.log('REGISTER SEES AUTHENTICATION AS' , this.context.isAuthenticated)
        return (
            <div>
                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>
                {
                    this.state.type === 'Applicant' ? 
                    (
                        <Container component='div' style={{border:'2px solid #80bfff' , height:'550px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                            <h3 style={{position:'relative' , top:'2rem'}} align="center">Enter the details below to Register as an Applicant</h3>
                            <form style={{position:'relative' , top:'2rem'}} onSubmit={this.onSubmit}>
                            
                                <TextField  name="type" onChange={this.onTypeChange} value={this.state.type} select helperText="Please select you type" fullWidth label="Type" variant="filled" margin='normal'>
                                    <MenuItem  value='Applicant'>Applicant</MenuItem>
                                    <MenuItem value='Recruiter'>Recruiter</MenuItem>
                                </TextField>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.name} type='text' name='name' fullWidth label="Name" variant="outlined" margin='normal'/>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.email} type='text' name='email' fullWidth label="Email" variant="outlined" margin='normal'/>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.password} type='password' name='password' fullWidth label="Password" variant="outlined" margin='normal'/>
                                
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    endIcon={<HowToRegIcon/>}
                                    style={{float:'left',position:'relative' , top:'1rem' , left:'12rem'}}
                                    type='submit'
                                >
                                    Register
                                </Button>
                            </form>
                            </Container>
                    ) : 
                    (
                        <Container component='div' style={{border:'2px solid #80bfff' , height:'700px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                            <h3 style={{position:'relative' , top:'2rem'}} align="center">Enter the details below to Register as a Job Recruiter</h3>
                            <form style={{position:'relative' , top:'2rem'}} onSubmit={this.onSubmit}>
                            
                                <TextField name="type" onChange={this.onTypeChange} value={this.state.type} select helperText="Please select you type" fullWidth label="Type" variant="filled" margin='normal'>
                                    <MenuItem  value='Applicant'>Applicant</MenuItem>
                                    <MenuItem value='Recruiter'>Recruiter</MenuItem>
                                </TextField>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.name} type='text' name='name' fullWidth label="Name" variant="outlined" margin='normal'/>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.email} type='email' name='email' fullWidth label="Email" variant="outlined" margin='normal'/>
                                
                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.password} type='password' name='password' fullWidth label="Password" variant="outlined" margin='normal'/>

                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><PhoneIcon /></InputAdornment>)}}  required onChange={this.onChange} value={this.state.contact} type='text' name='contact' fullWidth label="Contact" variant="outlined" margin='normal'/>

                                <TextField InputProps={{startAdornment: (<InputAdornment position="start"><InfoIcon /></InputAdornment>)}} multiline onChange={this.onChange} value={this.state.bio} type='text' name='bio' fullWidth label="Bio" variant="outlined" margin='normal'/>
                                
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    endIcon={<HowToRegIcon/>}
                                    style={{marginTop:'1rem' , marginLeft:'12rem'}}
                                    type='submit'
                                >
                                    Register
                                </Button>
                            </form>
                            </Container>
                    )
                }
                
            </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     error: state.error
// })

export default Register