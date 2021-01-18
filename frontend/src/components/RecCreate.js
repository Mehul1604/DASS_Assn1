import React, {Component} from 'react';
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {TextField,Button , MenuItem , Snackbar , InputAdornment} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import PhoneIcon from '@material-ui/icons/Phone';
import InfoIcon from '@material-ui/icons/Info';
import UserContext from '../context/UserContext'
import Loader from 'react-loader-spinner';
import { Row  , Col , Container} from 'react-bootstrap';

// import {connect} from 'react-redux'
// import {register , setNull , loadUser} from '../actions/authActions'
// import {clearErrors} from '../actions/errorActions'
// import PropTypes from 'prop-types'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }



class RecCreate extends Component {
    
    state = {
        name: '',
        email: '',
        title: '',
        max_app: '',
        max_pos: '',
        date_post: null,
        req_skills: [],
        type: '',
        duration: 0,
        salary: '',
        validOpen: false,
        errorMsg: '',
        loading: true
    }

    getRec = async (token) => {
        try{
            console.log('making axios now'  )
            const recruiter = await axios.get('/api/auth/rec/user' , {headers: {'x-auth-token' : token}})
            this.setState({
                name: recruiter.data.name,
                email: recruiter.data.name
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

    componentDidMount(){
        this.getRec(this.context.token)
    }
    
    static contextType = UserContext

    // onChange = (e) =>{
    //     this.setState({[e.target.name] : e.target.value})
        
    // }
    
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({validOpen: false})
      };


    render() {

        console.log(this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                <Container style={{marginTop:'3rem'}}>
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>Enter the details below to</h1>
                    <h1 style={{fontSize:'450%'}}> Create A Job</h1>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Container style={{border:'2px solid orange'}}>
                            HI
                        </Container>
                    </Row>
                </Container>
                
            </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     error: state.error
// })

export default RecCreate