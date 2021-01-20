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
        showRating: false,
        job_rate_id: '',
        rate: 0,
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

    getJobState = (job) =>{
        
        
        if(job.state === 'appFilled') return (<Button disabled key={"done-" + job._id} variant="danger">Applications Filled</Button>)
        if(job.state === 'posFilled') return (<Button disabled key={"posDone-" + job._id} variant="warning">Positions Filled</Button>)

        return (<Button disabled key={"active-" + job._id} variant="primary">Active</Button>)

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

    handleClose = (e) =>{
        this.setState({
            rate: 0,
            job_rate_id: '',
            showRating: false
        })
    }

    openRating =(id) =>{
        this.setState({
            job_rate_id: id,
            showRating: true
        })
    }

    appRate = (e) =>{
        this.setState({rate: e.target.value})
    }

    rateSubmit = async (e , id) =>{
        e.preventDefault()
        const body ={
            newRate: parseInt(this.state.rate)
        }

        console.log(body , id)

        this.setState({loading: true , rate: 0 , job_rate_id: '' , showRating: false})

        try{
            await axios.put(`/api/applicants/jobrate/${id}` , body , {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }
    }
    
    checkRate = (appl) =>{
        let job = appl.job_id
        if(appl.stage === 'accepted'){
            if(job.ratings.find(r => {
                if(r.app_id === this.context.user.id){
                    return true
                }
        
                return false
            })){
                return (
                    <>
                <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(job.ratings)}</span>
                </>
                )
            }
            else{
                return (
                    <>
                        <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(job.ratings)}</span>
                        <Button style={{marginLeft:'1rem' , position:'relative' , top:'-0.2rem'}} key="rate-open" onClick={(e) => this.openRating(job._id)}  type="button" variant="warning">Rate Job</Button>
                    </>
                )
            }
        }
        else{
            return (
                <>
            <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(job.ratings)}</span>
            </>
            )
        }
        
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

                <Modal show={this.state.showRating} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>Rate Employee</h2></Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={(e) => this.rateSubmit(e , this.state.job_rate_id)}>
                    <Modal.Body>
                        <Form.Control required onChange={this.appRate} value={this.state.rate} type="number" min={0} max={5} />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" type="button" onClick={this.handleClose}>
                        Close
                    </Button>
                    <Button variant="warning" type="submit">
                        Submit Rating
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>

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
                            <th>Job status</th>
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
                                <td>
                                   {this.checkRate(appl)} 
                                </td>
                                <td>{this.getJobState(appl.job_id)}</td>
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