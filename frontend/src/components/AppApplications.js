import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Snackbar} from '@material-ui/core'
import Rating from '@material-ui/lab/Rating';
import {Table , Container, Row, Form, Col, Button , Modal} from 'react-bootstrap'
import MuiAlert from '@material-ui/lab/Alert'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';
import Fuse from 'fuse.js'


// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

function makeButton(id,str){
    if(str === 'applied'){
        return (<Button disabled key={"applied-" + id} variant="dark">Applied</Button>)
    }
    if(str === 'shortlisted'){
        return (<Button disabled key={"shortlisted-" + id} variant="warning">Shortlisted</Button>)
    }
    if(str === 'accepted'){
        return (<Button disabled key={"accepted-" + id} variant="success">Accepted</Button>)
    }
    if(str === 'rejected'){
        return (<Button disabled key={"rejected-" + id} variant="danger">Rejected</Button>)
    }
}

class AppApplications extends Component {
    
    static contextType = UserContext

    state = {
        applicationData: null,
        showError: false,
        errorMsg: '',
        loading: true
    }

    // nameRef = React.createRef()

    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const applications = await axios.get('/api/applications/app' , {headers: {'x-auth-token' : token}})
            this.setState({
                applicationData: applications.data
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
        
        this.getData(this.context.token)
    }

    handleErrorClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({showError: false , errorMsg: ''})
      };

      getRating = (ratings_list) =>{
        let n = ratings_list.length
        if(n === 0) return 0
        let sum = 0
        for(let i = 0 ; i < n; i++){
            sum = sum + ratings_list[i].rate
        }

        return sum/n
    }
      

    
    render() {

        console.log("STATE ON THIS RENDER IS" , this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.showError} autoHideDuration={5000} onClose={this.handleErrorClose}>
                    <Alert onClose={this.handleErrorClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                <Container style={{marginTop:'3rem'}}>
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>My Applications</h1>
                    </Row>

                    <Row className="mt-3">
                        <Table striped hover>
                        <thead>
                            <tr>
                            <th>Job Title</th>
                            <th>Date of Joining</th>
                            <th>Salary</th>
                            <th>Recruiter Name</th>
                            <th>Status</th>
                            <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.applicationData.map(appl => (
                            <tr key={appl._id}>
                                <td>{appl.job_id.title}</td>
                                <td>{appl.date_join ? new Date(appl.date_join).toDateString() : 'Not Accepted'}</td>
                                <td>{appl.job_id.salary}</td>
                                <td>{appl.recruiter_id.name}</td>
                                <td>{makeButton(appl._id , appl.stage)}</td>
                                <td valign='center'>
                                    <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(appl.job_id.ratings)}</span>
                                    <Rating readOnly={appl.stage !== 'accepted'} value={this.getRating(appl.job_id.ratings)} precision={0.1}/>
                                </td>
                            </tr>
                            
                        ))}
                        </tbody>
                        </Table>
                    </Row>
                    
                </Container>
            </div>
        )
    }
}



export default AppApplications