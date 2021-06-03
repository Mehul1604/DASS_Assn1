import React, {Component} from 'react';
import {Container , Button} from '@material-ui/core'
import WorkIcon from '@material-ui/icons/Work';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import UserContext from '../context/UserContext'



class RecruiterHome extends Component {
    
    static contextType = UserContext
    render() {

        return (
            <div>   
                <Container component='div' style={{backgroundColor:'#ffff80', height:'290px' , borderRadius:'5%' , position:'relative' , top:'1rem' , border:'1px solid red'}} maxWidth='sm'>
                    <h1 style={{marginLeft:'2.5rem' , position:'relative' , top:'3rem' , fontSize:'3rem'}}>Welcome {this.context.user.name}</h1>

                    <Button 
                        variant="contained"
                        endIcon={<WorkIcon/>}
                        style={{marginLeft:'5.5rem' , marginTop:'5rem' , backgroundColor: '#ff9933'}}
                        onClick={() => this.props.history.push('/recJobs')}
                    >
                        My Jobs
                    </Button>

                    <Button 
                        variant="contained"
                        endIcon={<PersonIcon/>}
                        style={{marginLeft:'5.5rem' , marginTop:'5rem' , backgroundColor:'#5cd65c' , width:'10rem' , fontSize:'0.78rem' , height:'2.3rem'}}
                        onClick={() => this.props.history.push('/recEmployees')}
                    >
                        My Employees
                    </Button>
                    <Button 
                        variant="contained"
                        endIcon={<AddIcon/>}
                        style={{marginLeft:'10.8rem' , marginTop:'2rem' , backgroundColor:'yellow' , width:'10rem' , fontSize:'0.78rem' , height:'2.3rem'}}
                        onClick={() => this.props.history.push('/recCreate')}
                    >
                        Add Job
                    </Button>

                </Container>
           </div>
        )
    }
}



export default RecruiterHome