import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Container , Button} from '@material-ui/core'
import ReceiptIcon from '@material-ui/icons/Receipt';
import WorkIcon from '@material-ui/icons/Work';
import UserContext from '../context/UserContext'

// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

class ApplicantHome extends Component {
    
    static contextType = UserContext
    render() {
        // console.log(this.context)
        return (
            <div>   
                <Container component='div' style={{backgroundColor:'#b3ffb3', height:'250px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                    <h1 style={{marginLeft:'2.5rem' , position:'relative' , top:'3rem' , fontSize:'3rem'}}>Welcome {this.context.user.name}</h1>
                    {/* <Link to='/register'> */}
                    <Button 
                        variant="contained"
                        color="primary"
                        endIcon={<ReceiptIcon/>}
                        style={{marginLeft:'5rem' , marginTop:'5rem'}}
                        onClick={() => this.props.history.push('/appApps')}
                    >
                        My Applications
                    </Button>
                    {/* </Link> */}
                    {/* <Link to='/login'> */}
                    <Button 
                        variant="contained"
                        endIcon={<WorkIcon/>}
                        style={{marginLeft:'5rem' , marginTop:'5rem' , backgroundColor:'#5cd65c' , width:'8rem'}}
                        onClick={() => this.props.history.push('/appJobs')}
                    >
                        Job Listings
                    </Button>
                    {/* </Link> */}
                </Container>
           </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     user: state.auth.user,
//     error: state.error
// })

export default ApplicantHome