import React, {Component} from 'react';

import {Snackbar , Button as MButton} from '@material-ui/core'
import {Table , Container, Row, Form, Button , Modal} from 'react-bootstrap'
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import MuiAlert from '@material-ui/lab/Alert'
import Rating from '@material-ui/lab/Rating'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';
import {generate} from 'shortid'




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

class JobApps extends Component {
    
    static contextType = UserContext

    state = {
        jobData: null,
        applicationData: null,
        origApplications: null,
        showEdu: false,
        eduInfo: [],
        showSop: false,
        sop: '',
        sortSelected: 'None',
        sortOrder: '',
        showError: false,
        errorMsg: '',
        loading: true
    }

    // nameRef = React.createRef()

    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const job = await axios.get(`/api/jobs/job/${this.props.match.params.job_id}` , {headers: {'x-auth-token': token}})
            const applications = await axios.get(`/api/applications/rec/${this.props.match.params.job_id}` ,  {headers: {'x-auth-token': token}})
            console.log(applications.data)
            this.setState({
                jobData: job.data,
                applicationData: applications.data,
                origApplications: applications.data
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

    openEdu = (edu) =>{
        this.setState({
            showEdu: true,
            eduInfo: edu
        })
    }
    
      handleEduClose = (e) =>{
        this.setState({showEdu: false , eduInfo: []})
    }

    openSop = (sop) =>{
        this.setState({
            showSop: true,
            sop: sop
        })
    }
    
      handleSopClose = (e) =>{
        this.setState({showSop: false , sop: ''})
    }



    getRating = (ratings_list) =>{
        let n = ratings_list.length
        if(n === 0) return 0
        let sum = 0
        for(let i = 0 ; i < n; i++){
            sum = sum + ratings_list[i].rate
        }

        return sum/n
    }

    getAction = (id , stage) => {
        if(stage === 'applied'){
            return (
                <>
                <Button onClick={(e) => this.handleAction(id , 'shortlisted')}  key="shortlist-btn" variant="warning" type="button">Shortlist</Button>
                <Button onClick={(e) => this.handleAction(id , 'rejected')} style={{marginLeft:'1rem'}} key="reject-shortlist" variant="danger" type="button">Reject</Button>
                </>
            )
        }

        if(stage === 'shortlisted'){
            return (
                <>
                <Button onClick={(e) => this.handleAction(id , 'accepted')} key="accept-btn" variant="success" type="button">Accept</Button>
                <Button onClick={(e) => this.handleAction(id , 'rejected')} style={{marginLeft:'1rem'}} key="reject-accept" variant="danger" type="button">Reject</Button>
                </>
            )
        }

        return '-'
    }

    handleAction = async (id , newStage) =>{
        const body = {
            stage: newStage
        }
        console.log(body)

        this.setState({loading:true})
        
        try{
            if(newStage === 'accepted'){
                const mailBody = {
                    recruiterName: this.context.user.name,
                    applicationId: id
                }
                await axios.post('/api/sendMail' , mailBody , {headers : {'x-auth-token': this.context.token}})
            }
            await axios.put(`/api/applications/${id}` , body , {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }


    }

    onFilterChange = (e) =>{
        const sortSelected = e.target.name === 'sortSelected' ? e.target.value : this.state.sortSelected
        const sortOrder = e.target.name === 'sortOrder' ? e.target.value : this.state.sortOrder

        let filteredApps = this.state.origApplications.slice()
        

        console.log("OPTIONS SELECTED ARE" , sortSelected , sortOrder)

        if(sortSelected !== "None"){
            if(sortOrder === "Ascending"){
                switch(sortSelected){
                    case "Name":
                        filteredApps.sort((a,b) => {
                            if(a.applicant_id.name.toLowerCase() < b.applicant_id.name.toLowerCase())return -1;
                            if(a.applicant_id.name.toLowerCase() > b.applicant_id.name.toLowerCase()) return 1;

                            return 0;
                        })
                        break
                    case "Date_App":
                        filteredApps.sort((a,b) => {
                            if(Date.parse(a.date_of_app) < Date.parse(b.date_of_app)) return -1;
                            if(Date.parse(a.date_of_app) > Date.parse(b.date_of_app)) return 1;

                            return 0;
                        })
                        break
                    case "Rating":
                        filteredApps.sort((a,b) => {
                            if(this.getRating(a.applicant_id.ratings) < this.getRating(b.applicant_id.ratings)) return -1;
                            if(this.getRating(a.applicant_id.ratings) > this.getRating(b.applicant_id.ratings)) return 1;

                            return 0;
                        })
                        break
                }
            }
            else if(sortOrder === "Descending"){
                switch(sortSelected){
                    case "Name":
                        filteredApps.sort((a,b) => {
                            if(a.applicant_id.name.toLowerCase() < b.applicant_id.name.toLowerCase())return 1;
                            if(a.applicant_id.name.toLowerCase() > b.applicant_id.name.toLowerCase()) return -1;

                            return 0;
                        })
                        break
                    case "Date_App":
                        filteredApps.sort((a,b) => {
                            if(Date.parse(a.date_of_app) < Date.parse(b.date_of_app)) return 1;
                            if(Date.parse(a.date_of_app) > Date.parse(b.date_of_app)) return -1;

                            return 0;
                        })
                        break
                    case "Rating":
                        filteredApps.sort((a,b) => {
                            if(this.getRating(a.applicant_id.ratings) < this.getRating(b.applicant_id.ratings)) return 1;
                            if(this.getRating(a.applicant_id.ratings) > this.getRating(b.applicant_id.ratings)) return -1;

                            return 0;
                        })
                        break
                }
            }
        }


        this.setState({[e.target.name]: e.target.value , applicationData: filteredApps})
    }
   
    render() {

        console.log(this.context)
        // console.log("mehul" < "manasvi")
        // console.log("STATE ON THIS RENDER IS" , this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.showError} autoHideDuration={5000} onClose={this.handleErrorClose}>
                    <Alert onClose={this.handleErrorClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                {/*EDUCATION*/}
                <Modal show={this.state.showEdu} onHide={this.handleEduClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>Education Info</h2></Modal.Title>
                    </Modal.Header>
                    <Form>
                    <Modal.Body>
                        {this.state.eduInfo.map(edu => (
                            <div style={{borderBottom:'1px solid black' , marginBottom:'1rem'}} key={`${generate()}`}>
                                <Form  style={{marginBottom:'1rem'}}>
                                <Form.Label>Institution</Form.Label>
                                <Form.Control value={edu.institution} type='text' readOnly  />
                                <Form.Label>Start Year</Form.Label>
                                <Form.Control value={edu.start_year} type='text' readOnly  />
                                {edu.end_year ? (
                            <>
                            <Form.Label>End Year</Form.Label>
                            <Form.Control value={edu.end_year} type='text' readOnly  />
                            </>
                            ) : ''}
                            </Form>
                            </div>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" type="button" onClick={this.handleEduClose}>
                        Close
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>

                {/*SOP*/}

                <Modal show={this.state.showSop} onHide={this.handleSopClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>SOP</h2></Modal.Title>
                    </Modal.Header>
                    <Form>
                    <Modal.Body>
                      <Form.Control readOnly value={this.state.sop} as="textarea" rows={10} />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" type="button" onClick={this.handleSopClose}>
                        Close
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>


                <Container >
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>Applications for {this.state.jobData.title}</h1>
                    </Row>

                    <Row className="justify-content-md-center" style={{border:'1px solid black'  , padding:'1rem'}}>
                            <Form inline>
                                <Form.Label>Order by:</Form.Label>
                                <Form.Control  name="sortSelected" value={this.state.sortSelected} onChange={this.onFilterChange} className="mr-sm-4"  as="select">
                                    <option value="None">None</option>
                                    <option value="Name">Name</option>
                                    <option value="Date_App">Date of Application</option>
                                    <option value="Rating">Applicant Rating</option>
                                </Form.Control>
                                <Form.Control  name="sortOrder" value={this.state.sortOrder} onChange={this.onFilterChange} className="mr-sm-4"  as="select">
                                     <option value="">Select order</option>
                                    <option value="Ascending">Ascending</option>
                                    <option value="Descending">Descending</option>
                                </Form.Control>
                            
                            </Form>
                    </Row>
                    
                </Container>
                    <Container fluid>
                    <Row  className="mt-3">
                        <Table striped hover>
                        <thead>
                            <tr>
                            <th>Applicant Name</th>
                            <th>Applicant Skills</th>
                            <th>Date of Application</th>
                            <th>Applicant Education</th>
                            <th>SOP</th>
                            <th>Applicant Rating</th>
                            <th>Stage</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.applicationData.map(appl => (
                            <tr key={appl._id}>
                                <td>{appl.applicant_id.name}</td>
                                <td>{appl.applicant_id.skills.length ? appl.applicant_id.skills.join(',') : '-'}</td>
                                <td>{new Date(appl.date_of_app).toDateString()}</td> 
                                <td>
                                {appl.applicant_id.education.length ?  (<Button variant="primary" onClick={(e) => this.openEdu(appl.applicant_id.education)}>View Education</Button>) : '-'}
                                </td>
                                <td>
                                    <Button type="button" variant="primary" onClick={(e) => this.openSop(appl.sop)}>Show SOP</Button>
                                </td>
                                <td valign='center'>
                                    <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(appl.applicant_id.ratings)}</span>
                                    <Rating value={this.getRating(appl.applicant_id.ratings)} readOnly precision={0.1}/>
                                </td>
                                <td>{makeButton(appl._id , appl.stage)}</td>
                                <td>{this.getAction(appl._id , appl.stage)}</td>
                            </tr>
                            
                        ))}
                        </tbody>
                        </Table>
                    </Row>
                    <Row className="justify-content-md-center">
                    <MButton onClick={(e) => this.props.history.push('/recJobs')} endIcon={<KeyboardReturnIcon/>} variant="contained" style={{backgroundColor: 'orange'}}>Go back</MButton>
                    </Row>
                    </Container>
            </div>
        )
    }
}



export default JobApps