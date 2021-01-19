import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Snackbar} from '@material-ui/core'
import {Table , Container, Row, Form, Col, Button , Modal} from 'react-bootstrap'
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

class AppJobs extends Component {
    
    static contextType = UserContext

    state = {
        userData: null,
        jobs: null,
        origJobs: null,
        loading: true,
        sortSelected: "None",
        sortOrder: "",
        canSeacrh: false,
        search: "",
        showApply: false,
        jobApplyId: null,
        recruiterApplyId: null,
        sop: "",
        canFilter: false,
        sal_start: 0,
        sal_end: 0,
        max_sal_ceil: 0,
        dur_filter: 7,
        full_filter: true,
        part_filter: true,
        home_filter: true,
        showError: false,
        errorMsg: ''
    }

    // nameRef = React.createRef()

    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const applicant = await axios.get('/api/auth/app/user' , {headers: {'x-auth-token' : token}})
            const jobs = await axios.get('/api/jobs/app' ,  {headers: {'x-auth-token': token}})
            console.log(jobs.data)
            var sals = jobs.data.map(j => j.salary)
            var sal_max = Math.max(...sals)
            sal_max = 500 * Math.ceil(sal_max/500)
            this.setState({
                userData: applicant.data,
                jobs: jobs.data,
                origJobs: jobs.data,
                sal_end: sal_max,
                max_sal_ceil: sal_max
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


    selectSort = (e) =>{
        // console.log("criteria select ke pehle original jobs is " , this.state.origJobs)
        var backupJobs = this.state.origJobs.slice()
        this.setState({sortSelected: e.target.value , sortOrder: "" , jobs:backupJobs})
        console.log(this.state.sortSelected)
    }

    selectOrder = (e) =>{
        console.log("ORIG BEFORE" , this.state.origJobs)
        var order = e.target.value
        var criteria = this.state.sortSelected
        if(criteria === "None") return
        // console.log("ORIG JOBS IS" , this.state.origJobs)
        var backupJobs = this.state.origJobs
        var orderedJobs = backupJobs.slice()
        
        // console.log('ORDERED JOBS BEFORE', orderedJobs)
        if(order === "Ascending"){
            if(criteria === "Salary"){
                orderedJobs.sort((a,b) => {
                    if(a.salary < b.salary) return -1;
                    if(a.salary > b.salary) return 1;

                    return 0;
                })
            }

            if(criteria === "Duration"){
                orderedJobs.sort((a,b) => {
                    if(a.duration < b.duration) return -1;
                    if(a.duration > b.duration) return 1;

                    return 0;
                })
            }

            if(criteria === "Rating"){
                orderedJobs.sort((a,b) => {
                    if(a.rating < b.rating) return -1;
                    if(a.rating > b.rating) return 1;

                    return 0;
                })
            }
        }
        else if(order === "Descending"){
            if(criteria === "Salary"){
                orderedJobs.sort((a,b) => {
                    if(a.salary < b.salary) return 1;
                    if(a.salary > b.salary) return -1;

                    return 0;
                })
            }

            if(criteria === "Duration"){
                orderedJobs.sort((a,b) => {
                    if(a.duration < b.duration) return 1;
                    if(a.duration > b.duration) return -1;

                    return 0;
                })
            }

            if(criteria === "Rating"){
                orderedJobs.sort((a,b) => {
                    if(a.rating < b.rating) return 1;
                    if(a.rating > b.rating) return -1;

                    return 0;
                })
            }
        }
        else{
            console.log("setting back to original")
        }
        // console.log("ORDERED JOBS AFTER" , orderedJobs)
        this.setState({sortOrder: e.target.value , jobs:orderedJobs})
        console.log("ORIG AFTER" , this.state.origJobs)
    }

    setSeacrh = (e) =>{
        // console.log("set search")
        this.setState({canSeacrh: true})
    }

    cancelSearch = (e) =>{
        // console.log("cancel search")
        var backupJobs = this.state.origJobs.slice()
        this.setState({canSeacrh: false , search: "" , jobs:backupJobs})
    }

    onSearch = (e) =>{
        var filter = e.target.value
        filter = filter.replace(/\s+/g,' ').trim()
        filter = filter.toLowerCase()
        const searchedJobs = this.state.origJobs.filter(j => (j.title.toLowerCase().indexOf(filter) > -1))
        // console.log('SEARCHED JOBS ARE' , searchedJobs)
        this.setState({search: e.target.value , jobs: searchedJobs})
        // const fuse = new Fuse(this.state.origJobs , {keys: ['title']})
        // const searchedFuseJobs = fuse.search(e.target.value)
        // const searchedJobs = searchedFuseJobs.map(sf => sf.item)
        // console.log('FOLLOWING JOBS WERE SEARCHED' , searchedJobs)

    }

    getJobState = (job) =>{
        var applied_applicant_ids = job.application_ids.map(appl => {
             return appl.applicant_id
        })
        var cur_applicant_id = this.state.userData._id
        if(applied_applicant_ids.includes(cur_applicant_id)){
            if(this.state.userData.state === 'gotJob'){
                var accepted_application = this.state.userData.application_ids.filter(appl => appl.stage === 'accepted')[0]
                if(job._id === accepted_application.job_id._id) return (<Button disabled key={"emp-" + job._id} variant="dark">Employed</Button>)
            }
            return (<Button disabled key={"done-" + job._id} variant="success">Applied</Button>)
        }

        if(job.state === 'appFilled') return (<Button disabled key={"done-" + job._id} variant="danger">Applications Filled</Button>)
        if(job.state === 'posFilled') return (<Button disabled key={"posDone-" + job._id} variant="warning">Positions Filled</Button>)

        return (<Button key={"apply-" + job._id} variant="primary" onClick={(e) => this.openApply(e,job._id , job.recruiter_id._id)}>Apply</Button>)

    }

    handleClose = (e) =>{
        this.setState({showApply: false , jobApplyId: null , recruiterApplyId: null , sop:""})
    }

    openApply = (e , j_id , r_id) =>{
        if(this.state.userData.state === 'gotJob'){
            this.setState({
                showError: true,
                errorMsg: 'You already have a Job!'
            })
            return;
        }

        if(this.state.userData.num_applications === 10){
            this.setState({
                showError: true,
                errorMsg: "Can't fill more than 10 Applications!"
            })
            return;
        }
        this.setState({showApply: true , jobApplyId: j_id , recruiterApplyId: r_id})
    }

    sopChange = (e) =>{
        this.setState({sop: e.target.value})
    }

    handleSopSubmit = async (e) =>{
        var words = this.state.sop.split(/\s+/).length
        // console.log('TYPED' , this.state.sop , words)
        if(words > 5){
            this.setState({
                showError: true,
                errorMsg: 'SOP too long!'
            })
            return;
        }

        const newApplication = {
            sop: this.state.sop,
            job_id: this.state.jobApplyId,
            recruiter_id: this.state.recruiterApplyId
        }

        console.log(newApplication)
        this.setState({showApply: false , jobApplyId: null , recruiterApplyId: null , sop:"" , loading:true})

        try{
            await axios.post('/api/applications' , newApplication , {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }
        
    }

    handleErrorClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({showError: false , errorMsg: ''})
      };

      handleFilterSubmit = (e) =>{
          e.preventDefault()
          var backupJobs = this.state.origJobs.slice()
          console.log(backupJobs)
          var types_filtered = []
          if(this.state.full_filter){
              types_filtered.push('F')
          }
          if(this.state.part_filter){
            types_filtered.push('P')
          }
         if(this.state.home_filter){
            types_filtered.push('H')
          }
          console.log(types_filtered)
         
          var filteredJobs = backupJobs.filter(bj => {
            console.log(bj)
              if((bj.salary >= this.state.sal_start && bj.salary <= this.state.sal_end) && (bj.duration < this.state.dur_filter) && (types_filtered.includes(bj.jobType))){
                  return true
              }
              return false
          })
          this.setState({canFilter: false , jobs: filteredJobs})
      }

      editFilter = (e) =>{
          this.setState({canFilter: true})
      }

      resetFilter = (e) =>{
        var backup_max = this.state.max_sal_ceil
        var backupJobs = this.state.origJobs.slice()
        this.setState({
            canFilter: false,
            sal_start: 0,
            sal_end: backup_max,
            dur_filter: 7,
            full_filter: true,
            part_filter: true,
            home_filter: true,
            jobs: backupJobs

        })
    }

    filterChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        console.log(value)
        this.setState({[e.target.name]: value})
    }
      

    
    //   onClick={this.editName} style={{marginTop:'1rem' , marginLeft:'1rem'}}
    render() {
        // var x = [3,2,4,1]
        // var y = x.slice()
        // console.log(x,y)
        // x.sort()
        // console.log(x,y)
        // console.log(Date.parse(test))

        console.log("STATE ON THIS RENDER IS" , this.state)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.showError} autoHideDuration={5000} onClose={this.handleErrorClose}>
                    <Alert onClose={this.handleErrorClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                <Modal show={this.state.showApply} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title><h2>Submit SOP(250 words max)</h2></Modal.Title>
                    </Modal.Header>
                    <Form>
                    <Modal.Body>
                        <Form.Control onChange={this.sopChange} value={this.state.sop} as="textarea" rows={10} />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.handleSopSubmit}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>

                <Container style={{marginTop:'3rem'}}>
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>Search Active Jobs</h1>
                    </Row>
                    <Row style={{marginTop:'1rem' , border:'2px solid blue'}}>
                        <Col xs={4}>
                            <Form style={{marginTop:'5rem'}} inline>
                                <Form.Control onChange={this.onSearch} value={this.state.search} disabled={!this.state.canSeacrh} className="mr-sm-3" type='text' placeholder='Search by Title'/>
                                {!this.state.canSeacrh ? (<Button key="search-btn" onClick={this.setSeacrh} type="button">Search</Button>) : (<Button key="cancel-search-btn" variant="danger" onClick={this.cancelSearch} type="button">Cancel</Button>)}
                            </Form>
                        </Col>
                        <Col xs={8}>
                        <Row style={{border:'2px solid blue'  , padding:'1rem'}}>
                            <Form inline>
                                <Form.Label>Order by:</Form.Label>
                                <Form.Control className="mx-sm-2" value={this.state.sortSelected} onChange={this.selectSort} as="select">
                                    <option value="None">None</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Duration">Duration</option>
                                    <option value="Rating">Rating</option>
                                </Form.Control>
                                <Form.Control className="mx-sm-2" disabled={this.state.sortSelected === "None"} value={this.state.sortOrder} onChange={this.selectOrder} as="select">
                                     <option value="">Select order</option>
                                    <option value="Ascending">Ascending</option>
                                    <option value="Descending">Descending</option>
                                </Form.Control>
                            </Form>
                        </Row>
                        <Row  style={{border:'2px solid blue' , paddingLeft:'1rem'}}>
                            <Form onSubmit={this.handleFilterSubmit}>
                                <Form.Row>
                                <Form.Group  as={Col}>
                                    <Form.Label>Salary(Rs.):</Form.Label>
                                    <Form.Control name="sal_start" value={this.state.sal_start} onChange={this.filterChange} disabled={!this.state.canFilter} style={{marginBottom:'1rem'}} type="number" min={0} step={500} required placeholder="Start Range" />
                                    <Form.Control name="sal_end" value={this.state.sal_end} onChange={this.filterChange} disabled={!this.state.canFilter} type="number" min={0} step={500} required placeholder="End Range" />
                                </Form.Group>

                                <Form.Group style={{marginLeft:'2rem'}} as={Col}>
                                    <Form.Label>Duration(months):</Form.Label>
                                    <Form.Control name="dur_filter" value={this.state.dur_filter} onChange={this.filterChange} disabled={!this.state.canFilter} style={{marginTop:'1.5rem'}} as="select" required placeholder="Enter Duration" >
                                        <option value={1}>Indefinite(0)</option>
                                        <option value={2}>Less than 2</option>
                                        <option value={3}>Less than 3</option>
                                        <option value={4}>Less than 4</option>
                                        <option value={5}>Less than 5</option>
                                        <option value={6}>Less than 6</option>
                                        <option value={7}>Less than 7</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group style={{marginLeft:'2rem'}} as={Col}>
                                <Form.Label>Job Type</Form.Label>
                                    <Form.Check name="full_filter" checked={this.state.full_filter} onChange={this.filterChange} disabled={!this.state.canFilter} label="Full Time" type="checkbox" />
                                    <Form.Check name="part_filter" checked={this.state.part_filter} onChange={this.filterChange} disabled={!this.state.canFilter} label="Part Time" type="checkbox" />
                                    <Form.Check name="home_filter" checked={this.state.home_filter} onChange={this.filterChange} disabled={!this.state.canFilter} label="Work From Home" type="checkbox" />
                                </Form.Group>
                                <Form.Group style={{marginLeft:'1rem'}} as={Col}>
                                {!this.state.canFilter ? (
                                    <Button key="filter-edit" onClick={this.editFilter}  style={{marginTop:'1rem'}} variant="primary"  type="button">
                                        Change Filters
                                    </Button> 
                                ) : (
                                    <Button key="filter-submit"  style={{marginTop:'1rem'}} variant="success"  type="submit">
                                        Apply Filters
                                    </Button> 
                                )}
                                <Button key="filter-reset" onClick={this.resetFilter}  style={{marginTop:'1rem'}} variant="danger"  type="button">
                                    Reset Filters
                                </Button> 
                                </Form.Group>
                                

                                </Form.Row>
                            </Form>
                        </Row>
                        </Col>
                    </Row>
                    </Container>
                    <Container fluid>
                    <Row  className="mt-3">
                        <Table striped hover>
                        <thead>
                            <tr>
                            <th>Job Title</th>
                            <th>Date of Posting</th>
                            <th>Recruiter Name</th>
                            <th>Rating</th>
                            <th>Salary</th>
                            <th>Type</th>
                            <th>Remaining Applications</th>
                            <th>Remaining Positions</th>
                            <th>Required Skills</th>
                            <th>Duration</th>
                            <th>Deadline</th>
                            <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.jobs.map(job => (
                            <tr key={job._id}>
                                <td>{job.title}</td>
                                <td>{new Date(job.date_post).toDateString()}</td>
                                <td>{job.recruiter_id.name}</td>
                                <td valign='center'>
                                    <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{job.rating}</span>
                                    <Rating value={job.rating} readOnly precision={0.05}/>
                                </td>
                                <td>{job.salary}</td>
                                <td>{job.jobType}</td>
                                <td>{job.max_app - job.app}</td>
                                <td>{job.max_pos - job.pos}</td>
                                <td>{job.req_skills.join(',')}</td>
                                <td>{job.duration}</td>
                                <td>{new Date(job.deadline).toDateString()}</td>
                                <td>{this.getJobState(job)}</td>
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



export default AppJobs