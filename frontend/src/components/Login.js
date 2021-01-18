import React, {Component} from 'react';
import axios from 'axios'
import {TextField , Container ,Button , MenuItem , Snackbar , InputAdornment} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import UserContext from '../context/UserContext'

// import {connect} from 'react-redux'
// import {login , setNull , loadUser} from '../actions/authActions'
// import {clearErrors} from '../actions/errorActions'
// import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom';


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }



class Login extends Component {
    
    state = {
        email: '',
        password: '',
        type: 'Applicant',
        validOpen: false,
        errorMsg: ''
    }

    static contextType = UserContext

    // static propTypes = {
    //     isAuthenticated: PropTypes.bool,
    //     error: PropTypes.object.isRequired,
    //     login: PropTypes.func.isRequired,
    //     clearErrors: PropTypes.func.isRequired,
    //     setNull: PropTypes.func.isRequired,
    //     loadUser: PropTypes.func.isRequired

    // }

    // componentDidMount = () =>{
    //     if(this.props.isAuthenticated){
    //         this.setState({authDone: true})
    //     }
    //     this.props.loadUser()
    // }

    // componentDidUpdate = (prevProps) =>{
    //     const {error , isAuthenticated} = this.props
    //     console.log('The new props are' , error , isAuthenticated)
    //     // if(!error.id && !error.status && error.msg === '' && !isAuthenticated){
    //     //     return
    //     // }
        
    //     if(error !== prevProps.error){
    //         if(error.id === 'LOGIN_FAIL'){
    //             this.setState({
    //                 validOpen: true,
    //                 errorMsg: error.msg,
    //                 authDone: false
    //             })
    //         }
    //         else{
    //             this.setState({
    //                 validOpen: false,
    //                 errorMsg: ''
    //             })
    //         }
    //     }
    //     else{
    //         if(isAuthenticated){
    //             console.log('Logged in now')
    //             this.setState({authDone: true}) 
    //         }
    //     }
        
        
    // }

    onChange = (e) =>{
        this.setState({[e.target.name] : e.target.value})
        
    }
    onTypeChange = (e) =>{
        this.setState({[e.target.name] : e.target.value})

        this.setState({
            email: '',
            password:'',
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

    onSubmit = async (e) => {
        e.preventDefault();
        const  {email , password} = this.state
        console.log(email,password)

        var em = false
        if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)))
        {
            console.log('em true')
            em = true
        }

        if(em){
            console.log('email invalid')
            this.setState({
                validOpen: true,
                errorMsg: 'Invalid Email!'
            });
            return;
        }
        const loginUser = {
            email,password
        }
        

        // this.props.login(loginUser)

        axios.post('/api/auth/app' , loginUser)
            .then(res => {
                this.context.setUser(res.data.token , true , res.data.user)
                localStorage.setItem('token' , res.data.token)
                this.props.history.push('/')
            })
            .catch(err => {
                if(err.response.data.msg === 'User does not exist'){
                    axios.post('/api/auth/rec' , loginUser)
                        .then(res => {
                            this.context.setUser(res.data.token , true , res.data.user)
                            localStorage.setItem('token', res.data.token)
                            this.props.history.push('/')
                        })
                        .catch(err => {
                            this.setState({
                                validOpen: true,
                                errorMsg: err.response.data.msg
                            })
                        })
                }
                else{
                    this.setState({
                        validOpen: true,
                        errorMsg: err.response.data.msg
                    })
                }
            })

        this.setState({
            email: '',
            password:'',
            validOpen: false,
            errorMsg: ''
        });
    }

    render() {

        if(this.context.isAuthenticated){
            return <Redirect to ='/' />
        }
        return (
            <div>
                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>
                    
                <Container component='div' style={{border:'2px solid #80bfff' , height:'350px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                    <h3 style={{position:'relative' , top:'2rem' , left:'-1rem'}} align="center">Login</h3>
                    <form style={{position:'relative' , top:'2rem'}} onSubmit={this.onSubmit}>
                        
                        <TextField InputProps={{startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.email} type='text' name='email' fullWidth label="Email" variant="outlined" margin='normal'/>
                        
                        <TextField InputProps={{startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>)}} required onChange={this.onChange} value={this.state.password} type='password' name='password' fullWidth label="Password" variant="outlined" margin='normal'/>
                        
                        <Button 
                            variant="contained"
                            endIcon={<VpnKeyIcon/>}
                            style={{float:'left',position:'relative' , top:'2rem' , left:'13rem' , backgroundColor:'#5cd65c'}}
                            type='submit'
                        >
                            Login
                        </Button>
                    </form>
                    </Container>
                    
                
                
            </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     error: state.error
// })

export default Login