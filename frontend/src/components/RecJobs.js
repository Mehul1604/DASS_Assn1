import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Snackbar} from '@material-ui/core'
import {Table , Container, Row, Form, Col, Button , Modal , InputGroup} from 'react-bootstrap'
import {Search} from 'react-bootstrap-icons'
import MuiAlert from '@material-ui/lab/Alert'
import Rating from '@material-ui/lab/Rating'
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

  function formatDate(date) {
    var d = new Date(date)
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

class RecJobs extends Component {
    
    static contextType = UserContext

    state = {
        
        jobData : null,
        deadline: '',
        max_app: '',
        max_pos: '',
        edit_job: '',
        canEdit: false,
        canDelete: false,
        showError: false,
        errorMsg: '',
        loading: true
    }

    // nameRef = React.createRef()

    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const jobs = await axios.get('/api/jobs/rec' ,  {headers: {'x-auth-token': token}})
            console.log(jobs.data)
            this.setState({
                jobData: jobs.data,
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


    

    // getJobState = (job) =>{
    //     var applied_applicant_ids = job.application_ids.map(appl => {
    //          return appl.applicant_id
    //     })
    //     var cur_applicant_id = this.state.userData._id
    //     if(applied_applicant_ids.includes(cur_applicant_id)){
    //         if(this.state.userData.state === 'gotJob'){
    //             var accepted_application = this.state.userData.application_ids.filter(appl => appl.stage === 'accepted')[0]
    //             if(job._id === accepted_application.job_id._id) return (<Button disabled key={"emp-" + job._id} variant="dark">Employed</Button>)
    //         }
    //         return (<Button disabled key={"done-" + job._id} variant="success">Applied</Button>)
    //     }

    //     if(job.state === 'appFilled') return (<Button disabled key={"done-" + job._id} variant="danger">Applications Filled</Button>)
    //     if(job.state === 'posFilled') return (<Button disabled key={"posDone-" + job._id} variant="warning">Positions Filled</Button>)

    //     return (<Button key={"apply-" + job._id} variant="primary" onClick={(e) => this.openApply(e,job._id , job.recruiter_id._id)}>Apply</Button>)

    // }



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
            canEdit: false,
            max_pos: '',
            max_app: '',
            deadline: '',
            edit_job: ''
        })
    }

    handleDelClose = (e) =>{
        this.setState({
            canDelete: false,
            edit_job: ''
        })
    }

    showEdit = (job) =>{
        console.log('show me!')
        this.setState({
            canEdit: true,
            max_app: job.max_app,
            max_pos: job.max_pos,
            deadline: formatDate(job.deadline),
            edit_job: job
        })
    }

    showDelete = (job) =>{

        console.log('DEL MEE!')
        this.setState({
            canDelete: true,
            edit_job: job
        })
    }

    onJobChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onJobSubmit = async (e) =>{
        e.preventDefault()
        console.log('COMPARING WITH' , this.state.edit_job)
        if(this.state.max_pos < this.state.edit_job.pos){
            this.setState({
                showError: true,
                errorMsg: 'Max Positions cant be less than current positions'
            })
            return
        }
        if(this.state.max_app < this.state.edit_job.app){
            this.setState({
                showError: true,
                errorMsg: 'Max Applications cant be less than current applications'
            })
            return
        }
        const newJob = {
            max_pos: this.state.max_pos,
            max_app: this.state.max_app,
            deadline: this.state.deadline
        }

        console.log(newJob)
        this.setState({canEdit: false , edit_job: '' , max_app: '' , max_pos:"" , deadline:'' , loading: true})

        try{
            await axios.post(`/api/jobs/${this.state.edit_job._id}` , newJob , {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }
    }

    onDelete = async (e) =>{
        this.setState({
            canDelete: false,
            edit_job: '',
            loading: true
        })

        try{
            await axios.delete(`/api/jobs/${this.state.edit_job._id}` ,  {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }
    }
      

    
    //   onClick={this.editName} style={{marginTop:'1rem' , marginLeft:'1rem'}}
    render() {


        // console.log("STATE ON THIS RENDER IS" , this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.showError} autoHideDuration={5000} onClose={this.handleErrorClose}>
                    <Alert onClose={this.handleErrorClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                <Modal show={this.state.canEdit} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>Edit Job</h2></Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={this.onJobSubmit}>
                        <Modal.Body>
                            <Form.Label>Max Applications</Form.Label>
                            <Form.Control required  style={{marginBottom:'1rem'}} name="max_app" value={this.state.max_app} onChange={this.onJobChange} min={1} type="number"/>
                            <Form.Label>Max Positions</Form.Label>
                            <Form.Control required style={{marginBottom:'1rem'}} name="max_pos" value={this.state.max_pos} onChange={this.onJobChange} min={1} type="number"/>
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control required style={{marginBottom:'1rem'}} name="deadline" value={this.state.deadline} onChange={this.onJobChange} type="date"/>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button type="submit" variant="success">
                            Save Changes
                        </Button>
                        <Button type="button" variant="danger" onClick={this.handleClose}>
                            Close
                        </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                <Modal show={this.state.canDelete} onHide={this.handleDelClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>Are you Sure?</h2></Modal.Title>
                    </Modal.Header>
                        <Modal.Body>
                            <h4>This will Delete any applications related to this Job</h4>
                        
                        <Button style={{marginLeft:'7rem'}} type="button" onClick={this.onDelete} variant="danger">
                            Delete
                        </Button>
                        <Button style={{marginLeft:'7rem'}} type="button" variant="warning" onClick={this.handleDelClose}>
                            Cancel
                        </Button>
                        </Modal.Body>
                </Modal>

                <Container >
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>View Active Jobs</h1>
                    </Row>
                    
                </Container>
                    <Container fluid>
                    <Row  className="mt-3">
                        <Table striped hover>
                        <thead>
                            <tr>
                            <th>Job Title</th>
                            <th>Date of Posting</th>
                            <th>Deadline</th>
                            <th>Max Number of Positions</th>
                            <th>Max Number of Applications</th>
                            <th>Positions Remaining</th>
                            <th>Number of Applications</th>
                            <th>Edit</th>
                            <th>Delete</th>
                            <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.jobData.map(job => (
                            <tr key={job._id}>
                                <td>{job.title}</td>
                                <td>{new Date(job.date_post).toDateString()}</td>
                                <td>{new Date(job.deadline).toDateString()}</td> 
                                <td>{job.max_pos}</td>
                                <td>{job.max_app}</td>
                                <td>{job.max_pos - job.pos}</td>
                                <td>{job.app}</td>
                                <td>
                                    <Button type="button" key={"edit-btn-" + job._id} onClick={(e) => this.showEdit(job)} variant="primary">
                                        Edit
                                    </Button>
                                </td>
                                <td> 
                                    <Button type="button"  key={"del-btn-" + job._id} onClick={(e) => this.showDelete(job)} variant="danger">
                                        Delete
                                    </Button>
                                </td>
                                <td>
                                    <Button onClick={(e) => this.props.history.push(`jobApps/${job._id}`)} variant="secondary" type="button" key="appl-btn">
                                        See Applications
                                    </Button>
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



export default RecJobs