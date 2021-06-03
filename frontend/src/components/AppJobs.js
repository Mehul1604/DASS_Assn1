import React, {Component} from 'react';
import {Snackbar} from '@material-ui/core'
import {Table , Container, Row, Form, Col, Button , Modal , InputGroup} from 'react-bootstrap'
import {Search} from 'react-bootstrap-icons'
import MuiAlert from '@material-ui/lab/Alert'
import Rating from '@material-ui/lab/Rating'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';
import Fuse from 'fuse.js'



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
        showApply: false,
        jobApplyId: null,
        recruiterApplyId: null,
        sop: "",
        sortSelected: "None",
        sortOrder: "",
        search: "",
        sal_start: 0,
        sal_end: "",
        dur_filter: 7,
        full_filter: true,
        part_filter: true,
        home_filter: true,
        showError: false,
        errorMsg: ''
    }


    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const applicant = await axios.get('/api/auth/app/user' , {headers: {'x-auth-token' : token}})
            const jobs = await axios.get('/api/jobs/app' ,  {headers: {'x-auth-token': token}})
            console.log(jobs.data)
            this.setState({
                userData: applicant.data,
                jobs: jobs.data,
                origJobs: jobs.data,
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


        e.preventDefault()
        let sop_text = this.state.sop
        let word_sent = sop_text.replace(/\s+/g, ' ').trim()
        console.log(word_sent , word_sent.length)
        let word_arr = word_sent.split(' ')
        if(word_arr.length === 1){
            if(word_arr[0] === ''){
                this.setState({
                    showError: true,
                    errorMsg: 'SOP cant be empty!'
                })
                return;
            }
        }

        if(word_arr.length > 250){
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


    onFilterChange = (e) =>{
        const search = e.target.name === 'search' ? e.target.value : this.state.search
        const sortSelected = e.target.name === 'sortSelected' ? e.target.value : this.state.sortSelected
        const sortOrder = e.target.name === 'sortOrder' ? e.target.value : this.state.sortOrder
        const sal_start = e.target.name === 'sal_start' ? e.target.value : this.state.sal_start
        const sal_end = e.target.name === 'sal_end' ? e.target.value : this.state.sal_end
        const dur_filter = e.target.name === 'dur_filter' ? e.target.value : this.state.dur_filter
        const full_filter = e.target.name === 'full_filter' ? e.target.checked : this.state.full_filter
        const part_filter = e.target.name === 'part_filter' ? e.target.checked : this.state.part_filter
        const home_filter = e.target.name === 'home_filter' ? e.target.checked : this.state.home_filter

        let type_array = []
        if(full_filter){
            type_array.push('F')
        }
        if(part_filter){
            type_array.push('P')
        }
        if(home_filter){
            type_array.push('H')
        }

        console.log('NEW FILTERS ARE' , search , sortSelected , sortOrder , sal_start , sal_end , dur_filter , full_filter , part_filter , home_filter)

        let filteredJobs = this.state.origJobs.slice()

        if(sal_end !== ""){filteredJobs = filteredJobs.filter(fj => fj.salary >= sal_start && fj.salary <= sal_end)}
        else {filteredJobs = filteredJobs.filter(fj => fj.salary >= sal_start)}
        
        filteredJobs = filteredJobs.filter(fj => fj.duration < dur_filter)
        filteredJobs = filteredJobs.filter(fj => type_array.includes(fj.jobType))

        if(search !== ""){
            let search_filter = search
            search_filter= search_filter.replace(/\s+/g,' ').trim()
            search_filter = search_filter.toLowerCase()
            // filteredJobs = filteredJobs.filter(fj => (fj.title.toLowerCase().indexOf(search_filter) > -1))
            const fuse = new Fuse(filteredJobs , {keys: ['title']})
            filteredJobs = fuse.search(search_filter).map(sf => sf.item)
        }
        

        if(sortSelected !== "None"){
            if(sortOrder === "Ascending"){
                switch(sortSelected){
                    case "Salary":
                        filteredJobs.sort((a,b) => {
                            if(a.salary < b.salary) return -1
                            if(a.salary > b.salary) return 1
                            return 0
                        })
                        break
                    case "Rating":
                        filteredJobs.sort((a,b) => {
                            if(this.getRating(a.ratings) < this.getRating(b.ratings)) return -1
                            if(this.getRating(a.ratings) > this.getRating(b.ratings)) return 1
                            return 0
                        })
                        break
                    case "Duration":
                        filteredJobs.sort((a,b) => {
                            if(a.duration < b.duration) return -1
                            if(a.duration > b.duration) return 1
                            return 0
                        })
                        break
                }
            }
            else if(sortOrder === "Descending"){
                switch(sortSelected){
                    case "Salary":
                        filteredJobs.sort((a,b) => {
                            if(a.salary < b.salary) return 1
                            if(a.salary > b.salary) return -1
                            return 0
                        })
                        break
                    case "Rating":
                        filteredJobs.sort((a,b) => {
                            if(this.getRating(a.ratings) < this.getRating(b.ratings)) return 1
                            if(this.getRating(a.ratings) > this.getRating(b.ratings)) return -1
                            return 0
                        })
                        break
                    case "Duration":
                        filteredJobs.sort((a,b) => {
                            if(a.duration < b.duration) return 1
                            if(a.duration > b.duration) return -1
                            return 0
                        })
                        break
                }
            }
        }

        if(e.target.type === 'checkbox'){
            this.setState({[e.target.name]: e.target.checked , jobs: filteredJobs})
        }
        else{
            this.setState({[e.target.name]: e.target.value , jobs: filteredJobs})
        }
    }

    resetFilters = (e) => {
        var backupJobs = this.state.origJobs.slice()
        this.setState({
            sortSelected: "None",
            sortOrder: "",
            search: "",
            sal_start: 0,
            sal_end: "",
            dur_filter: 7,
            full_filter: true,
            part_filter: true,
            home_filter: true,
            jobs: backupJobs
        })
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
      

    

    render() {



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
                    <Form onSubmit={this.handleSopSubmit}>
                    <Modal.Body>
                        <Form.Control required onChange={this.sopChange} value={this.state.sop} as="textarea" rows={10} />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" type="button" onClick={this.handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                    </Modal.Footer>
                    </Form>
                </Modal>

                <Container style={{marginTop:'3rem'}}>
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>Search Jobs</h1>
                    </Row>
                    <Row style={{marginTop:'1rem' , border:'1px solid black'}}>

                        <Col>
                        <Row className="justify-content-md-center" style={{border:'1px solid black'  , padding:'1rem'}}>
                            <Form inline>
                                <Form.Label>Order by:</Form.Label>
                                <Form.Control onChange={this.onFilterChange} value={this.state.sortSelected} name="sortSelected" className="mr-sm-4"  as="select">
                                    <option value="None">None</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Duration">Duration</option>
                                    <option value="Rating">Rating</option>
                                </Form.Control>
                                <Form.Control onChange={this.onFilterChange} value={this.state.sortOrder} name="sortOrder" className="mr-sm-4"  as="select">
                                     <option value="">Select order</option>
                                    <option value="Ascending">Ascending</option>
                                    <option value="Descending">Descending</option>
                                </Form.Control>
                                <InputGroup>
                                
                                <Form.Control aria-label="Username" onChange={this.onFilterChange} value={this.state.search} name="search"  className="ml-sm-5" type='text' placeholder='Search by Title'/>
                                <InputGroup.Append>
                               <Search color='blue' className="mt-2 ml-2"/>
                               </InputGroup.Append>
                               </InputGroup>
                            </Form>
                        </Row>
                        <Row className="justify-content-md-center" style={{border:'1px solid black' , paddingLeft:'1rem' , paddingTop:'2rem'}}>
                            <Form>
                                <Form.Row>
                                <Form.Group  as={Col}>
                                    <Form.Label>Salary(Rs.):</Form.Label>
                                    <Form.Control onChange={this.onFilterChange} value={this.state.sal_start} name="sal_start"  style={{marginBottom:'1rem'}} type="number" min={0} step={500} required placeholder="Start Range" />
                                    <Form.Control onChange={this.onFilterChange} value={this.state.sal_end} name="sal_end"  type="number" min={0} step={500} required placeholder="End Range" />
                                </Form.Group>

                                <Form.Group style={{marginLeft:'2rem'}} as={Col}>
                                    <Form.Label>Duration(months):</Form.Label>
                                    <Form.Control onChange={this.onFilterChange} value={this.state.dur_filter} name="dur_filter"  style={{marginTop:'1.5rem'}} as="select" required placeholder="Enter Duration" >
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
                                    <Form.Check onChange={this.onFilterChange} checked={this.state.full_filter} name="full_filter"  label="Full Time" type="checkbox" />
                                    <Form.Check onChange={this.onFilterChange} checked={this.state.part_filter} name="part_filter"  label="Part Time" type="checkbox" />
                                    <Form.Check onChange={this.onFilterChange} checked={this.state.home_filter} name="home_filter"  label="Work From Home" type="checkbox" />
                                </Form.Group>
                                <Form.Group style={{marginLeft:'1rem'}} as={Col}>
                                
                                <Button key="filter-reset" onClick={this.resetFilters}  style={{marginTop:'2rem'}} variant="danger"  type="button">
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
                                    <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(job.ratings)}</span>
                                    <Rating value={this.getRating(job.ratings)} readOnly precision={0.05}/>
                                </td>
                                <td>{job.salary}</td>
                                <td>{job.jobType === 'F' ? 'Full Time' : job.jobType === 'P' ? 'Part Time' : 'Work From Home'}</td>
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