import React, {Component} from 'react';
import {Container , Button} from '@material-ui/core'
import ReceiptIcon from '@material-ui/icons/Receipt';
import WorkIcon from '@material-ui/icons/Work';
import UserContext from '../context/UserContext'



class ApplicantHome extends Component {
    
    static contextType = UserContext
    render() {

        return (
            <div>   
                <Container component='div' style={{backgroundColor:'#b3ffb3', height:'250px' , borderRadius:'5%' , position:'relative' , top:'1rem'}} maxWidth='sm'>
                    <h1 style={{marginLeft:'2.5rem' , position:'relative' , top:'3rem' , fontSize:'3rem'}}>Welcome {this.context.user.name}</h1>

                    <Button 
                        variant="contained"
                        color="primary"
                        endIcon={<ReceiptIcon/>}
                        style={{marginLeft:'5rem' , marginTop:'5rem'}}
                        onClick={() => this.props.history.push('/appApps')}
                    >
                        My Applications
                    </Button>

                    <Button 
                        variant="contained"
                        endIcon={<WorkIcon/>}
                        style={{marginLeft:'5rem' , marginTop:'5rem' , backgroundColor:'#5cd65c' , width:'8rem'}}
                        onClick={() => this.props.history.push('/appJobs')}
                    >
                        Job Listings
                    </Button>

                </Container>
           </div>
        )
    }
}



export default ApplicantHome