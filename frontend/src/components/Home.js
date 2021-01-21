import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Container , Button} from '@material-ui/core'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import UserContext from '../context/UserContext'
import ApplicantHome from './ApplicantHome'
import RecruiterHome from './RecruiterHome'

// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

class Home extends Component {
    
    static contextType = UserContext

    // static propTypes = {
    //     isAuthenticated: PropTypes.bool,
    //     user: PropTypes.object,
    //     error: PropTypes.object,
    //     loadUser: PropTypes.func.isRequired

    // }
    // componentDidMount = () =>{
    //     console.log('home mounted')
    //     this.props.loadUser()
    //     console.log(this.props.isAuthenticated)
    // }

    // componentDidUpdate = (prevProps) =>{
    //     const {isAuthenticated , user , error} = this.props
    //     if(error !== prevProps.error){
    //         if(error.id === 'AUTH_ERROR'){
    //             this.setState({isLoading: false})
    //         }
    //     }
    //     else if(isAuthenticated !== prevProps.isAuthenticated){
    //         if(isAuthenticated){
    //             this.setState({isLoading: false})
    //         }
    //     }
    // }
    render() {
        console.log(this.context)
        if(!this.context.isAuthenticated)
        {
            return (
                <div>   
                    <Container component='div' style={{backgroundColor:'#cfe8fc', height:'250px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                        <h1 style={{marginLeft:'2.5rem' , position:'relative' , top:'3rem' , fontSize:'3rem'}}>Welcome to JobMart</h1>
                        {/* <Link to='/register'> */}
                        <Button 
                            variant="contained"
                            color="primary"
                            endIcon={<HowToRegIcon/>}
                            style={{marginLeft:'5.5rem' , marginTop:'5rem'}}
                            onClick={() => this.props.history.push('/register')}
                        >
                            Register
                        </Button>
                        {/* </Link> */}
                        {/* <Link to='/login'> */}
                        <Button 
                            variant="contained"
                            endIcon={<VpnKeyIcon/>}
                            style={{marginLeft:'5.5rem' , marginTop:'5rem' , backgroundColor:'#5cd65c' , width:'8rem'}}
                            onClick={() => this.props.history.push('/login')}
                        >
                            Login
                        </Button>
                        {/* </Link> */}
                    </Container>
               </div>
            )
        }
        else{
            if(this.context.user.type === 'Applicant')
            {
                return <ApplicantHome history={this.props.history}/>
            }
            else{
                return <RecruiterHome history={this.props.history}/>
            }
        }
        
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     user: state.auth.user,
//     error: state.error
// })

export default Home