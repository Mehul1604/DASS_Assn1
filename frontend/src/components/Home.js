import React, {Component} from 'react';
import {Container , Button} from '@material-ui/core'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import UserContext from '../context/UserContext'
import ApplicantHome from './ApplicantHome'
import RecruiterHome from './RecruiterHome'



class Home extends Component {
    
    static contextType = UserContext

    
    render() {
        console.log(this.context)
        if(!this.context.isAuthenticated)
        {
            return (
                <div>   
                    <Container component='div' style={{backgroundColor:'#cfe8fc', height:'250px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                        <h1 style={{marginLeft:'2.5rem' , position:'relative' , top:'3rem' , fontSize:'3rem'}}>Welcome to JobMart</h1>

                        <Button 
                            variant="contained"
                            color="primary"
                            endIcon={<HowToRegIcon/>}
                            style={{marginLeft:'5.5rem' , marginTop:'5rem'}}
                            onClick={() => this.props.history.push('/register')}
                        >
                            Register
                        </Button>

                        <Button 
                            variant="contained"
                            endIcon={<VpnKeyIcon/>}
                            style={{marginLeft:'5.5rem' , marginTop:'5rem' , backgroundColor:'#5cd65c' , width:'8rem'}}
                            onClick={() => this.props.history.push('/login')}
                        >
                            Login
                        </Button>

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



export default Home