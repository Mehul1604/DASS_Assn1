import React, {Component} from 'react';
import {Snackbar} from '@material-ui/core'
import Rating from '@material-ui/lab/Rating';
import {Table , Container, Row, Form, Col, Button , Modal} from 'react-bootstrap'
import MuiAlert from '@material-ui/lab/Alert'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';


// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

// function makeButton(id,str){
//     if(str === 'applied'){
//         return (<Button disabled key={"applied-" + id} variant="dark">Applied</Button>)
//     }
//     if(str === 'shortlisted'){
//         return (<Button disabled key={"shortlisted-" + id} variant="warning">Shortlisted</Button>)
//     }
//     if(str === 'accepted'){
//         return (<Button disabled key={"accepted-" + id} variant="success">Accepted</Button>)
//     }
//     if(str === 'rejected'){
//         return (<Button disabled key={"rejected-" + id} variant="danger">Rejected</Button>)
//     }
// }

class RecEmployees extends Component {
    
    static contextType = UserContext

    state = {
        employeesData: [],
        origEmployees: [],
        rate: 0,
        app_rate_id: '',
        sortSelected: 'None',
        sortOrder: '',
        showRating: false,
        showError: false,
        errorMsg: '',
        loading: true
    }

    // nameRef = React.createRef()

    getData = async (token) => {
        try{
            console.log('making axios now'  )
            const employees = await axios.get('/api/recruiters/emps' , {headers: {'x-auth-token' : token}})
            this.setState({
                employeesData: employees.data,
                origEmployees: employees.data
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

    handleClose = (e) =>{
        this.setState({
            rate: 0,
            app_rate_id: '',
            showRating: false
        })
    }

    openRating =(id) =>{
        this.setState({
            app_rate_id: id,
            showRating: true
        })
    }

    appRate = (e) =>{
        this.setState({rate: e.target.value})
    }

    rateSubmit = async (e , id) =>{
        e.preventDefault()
        const body = {
            newRate: parseInt(this.state.rate)
        }

        console.log(body)

        this.setState({loading: true , rate: 0 , app_rate_id: '' , showRating: false})

        try{
            await axios.put(`/api/recruiters/apprate/${id}` , body , {headers: {'x-auth-token': this.context.token}})

            this.getData(this.context.token)
        }
        catch(err){
            console.log(err.response.data)
        }
    }

    checkRate = (emp) =>{
        if(emp.applicant_id.ratings.find(r => {
            if(r.rec_id === this.context.user.id){
                return true
            }
    
            return false
        })){
            return (
                <>
            <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(emp.applicant_id.ratings)}</span>
            <Rating precision={1} readOnly value={this.getRating(emp.applicant_id.ratings)}/>
            </>
            )
        }
        else{
            return (
                <>
                    <span style={{position:'relative' , top:'-4.5px' , marginRight:'1rem'}}>{this.getRating(emp.applicant_id.ratings)}</span>
                    <Rating precision={1} readOnly value={this.getRating(emp.applicant_id.ratings)}/>
                    <Button style={{marginLeft:'1rem' , position:'relative' , top:'-0.2rem'}} key="rate-open" onClick={(e) => this.openRating(emp.applicant_id._id)}  type="button" variant="warning">Rate Employee</Button>
                </>
            )
        }
    }

    onFilterChange = (e) =>{
        const sortSelected = e.target.name === 'sortSelected' ? e.target.value : this.state.sortSelected
        const sortOrder = e.target.name === 'sortOrder' ? e.target.value : this.state.sortOrder

        let filteredEmps = this.state.origEmployees.slice()
        // let test = this.state.origEmployees.slice()

        // test.sort((a,b) => {
        //     if(a.applicant_id.name < b.applicant_id.name) return -1;
        //     if(a.applicant_id.name > b.applicant_id.name) return 1;

        //     return 0;
        // })

        // console.log('TEST' , test)

        console.log("OPTIONS SELECTED ARE" , sortSelected , sortOrder)
        //console.log("emps before" , filteredEmps)
        if(sortSelected !== "None"){
            if(sortOrder === "Ascending"){
                switch(sortSelected){
                    case "Name":
                        filteredEmps.sort((a,b) => {
                            if(a.applicant_id.name < b.applicant_id.name)return -1;
                            if(a.applicant_id.name > b.applicant_id.name) return 1;

                            return 0;
                        })
                        break
                    case "Title":
                        filteredEmps.sort((a,b) => {
                            if(a.job_id.title < b.job_id.title) return -1;
                            if(a.job_id.title > b.job_id.title) return 1;

                            return 0;
                        })
                        break
                    case "Date_Join":
                        filteredEmps.sort((a,b) => {
                            if(Date.parse(a.date_join) < Date.parse(b.date_join)) return -1;
                            if(Date.parse(a.date_join) > Date.parse(b.date_join)) return 1;

                            return 0;
                        })
                        break
                    case "Rating":
                        filteredEmps.sort((a,b) => {
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
                        filteredEmps.sort((a,b) => {
                            if(a.applicant_id.name < b.applicant_id.name) return 1;
                            if(a.applicant_id.name > b.applicant_id.name) return -1;

                            return 0;
                        })
                        break
                    case "Title":
                        filteredEmps.sort((a,b) => {
                            if(a.job_id.title < b.job_id.title) return 1;
                            if(a.job_id.title > b.job_id.title) return -1;

                            return 0;
                        })
                        break
                    case "Date_Join":
                        filteredEmps.sort((a,b) => {
                            if(Date.parse(a.date_join) < Date.parse(b.date_join)) return 1;
                            if(Date.parse(a.date_join) > Date.parse(b.date_join)) return -1;

                            return 0;
                        })
                        break
                    case "Rating":
                        filteredEmps.sort((a,b) => {
                            if(this.getRating(a.applicant_id.ratings) < this.getRating(b.applicant_id.ratings)) return 1;
                            if(this.getRating(a.applicant_id.ratings) > this.getRating(b.applicant_id.ratings)) return -1;

                            return 0;
                        })
                        break
                }
            }
        }

        console.log("emps after" , filteredEmps)

        this.setState({[e.target.name]: e.target.value , employeesData: filteredEmps})
    }
      

    
    render() {

        // console.log("STATE ON THIS RENDER IS" , this.state)
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
                    <Form onSubmit={(e) => this.rateSubmit(e , this.state.app_rate_id)}>
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
                    <h1 style={{fontSize:'450%'}}>My Employees</h1>
                    </Row>

                    <Row className="justify-content-md-center" style={{border:'1px solid black'  , padding:'1rem'}}>
                            <Form inline>
                                <Form.Label>Order by:</Form.Label>
                                <Form.Control value={this.state.sortSelected} onChange={this.onFilterChange}  name="sortSelected" className="mr-sm-4"  as="select">
                                    <option value="None">None</option>
                                    <option value="Name">Name</option>
                                    <option value="Title">Job Title</option>
                                    <option value="Date_Join">Date of Joining</option>
                                    <option value="Rating">Rating</option>
                                </Form.Control>
                                <Form.Control value={this.state.sortOrder} onChange={this.onFilterChange} name="sortOrder" className="mr-sm-4"  as="select">
                                     <option value="">Select order</option>
                                    <option value="Ascending">Ascending</option>
                                    <option value="Descending">Descending</option>
                                </Form.Control>
                            
                            </Form>
                    </Row>

                    <Row className="mt-3">
                        <Table striped hover>
                        <thead>
                            <tr>
                            <th>Name</th>
                            <th>Date of Joining</th>
                            <th>Job Type</th>
                            <th>Job Title</th>
                            <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.employeesData.map(emp => (
                            <tr key={emp._id}>
                                <td>{emp.applicant_id.name}</td>
                                <td>{new Date(emp.date_join).toDateString()}</td>
                                <td>{emp.job_id.jobType === 'F' ? 'Full Time' : emp.job_id.jobType === 'P' ? 'Part Time' : 'Work From Home'}</td>
                                <td>{emp.job_id.title}</td>
                                <td>
                                {this.checkRate(emp)}
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



export default RecEmployees