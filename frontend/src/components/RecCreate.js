import React, {Component} from 'react';
import axios from 'axios'
import {Snackbar  , Button} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import AddIcon from '@material-ui/icons/Add';
import UserContext from '../context/UserContext'
import Loader from 'react-loader-spinner';
import { Row  , Col , Container , Form} from 'react-bootstrap';
import Select from 'react-select';


const predefSkills = [
    {
        value: 1,
        label: 'Python'
    },
    {
        value: 2,
        label: 'C++'
    },
    {
        value: 3,
        label: 'Javascript'
    },
    {
        value: 4,
        label: 'MySQL'
    },
    {
        value: 5,
        label: 'TensorFlow'
    },
    {   
        value: 6,
        label: 'C'
    },
    {
        value: 7,
        label: 'Java'
    }
]

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

function todayDate() {
    var d = new Date()
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}



class RecCreate extends Component {
    
    state = {
        name: '',
        email: '',
        title: '',
        max_app: 1,
        max_pos: 1,
        req_skills: [],
        type: 'F',
        duration: 0,
        salary: 0,
        deadline: todayDate(),
        validOpen: false,
        errorMsg: '',
        loading: true
    }

    getRec = async (token) => {
        try{
            console.log('making axios now'  )
            const recruiter = await axios.get('/api/auth/rec/user' , {headers: {'x-auth-token' : token}})
            this.setState({
                name: recruiter.data.name,
                email: recruiter.data.email
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
        this.getRec(this.context.token)
    }
    
    static contextType = UserContext

    
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({validOpen: false})
      };

      onChange = (e) => {
          this.setState({[e.target.name]: e.target.value})
      }

      onSkillChange = (e) =>{
        this.setState({req_skills: Array.isArray(e) ? e.map(x => x.label) : []})
        console.log(this.state.req_skills)
      }

      handleSubmit = async (e) =>{
          e.preventDefault()
          console.log(this.state)
          
          const newJob = {
              title: this.state.title,
              max_app: this.state.max_app,
              max_pos: this.state.max_pos,
              deadline: this.state.deadline,
              req_skills: this.state.req_skills,
              jobType: this.state.type,
              duration: this.state.duration,
              salary: this.state.salary
          }
          try{
            console.log('making axios post now..'  )
            this.setState({loading: true})
            await axios.post('/api/jobs' , newJob,  {headers: {'x-auth-token' : this.context.token}})
            this.getRec(this.context.token)
            this.setState({
                validOpen: true,
                errorMsg: 'Job successfully created',
                title: '',
                max_app: 1,
                max_pos: 1,
                req_skills: [],
                type: 'F',
                duration: 0,
                salary: 0,
                deadline: todayDate()

            })
            
        }
        catch(err){
            console.log(err.response.data)
            this.context.logOut()
            this.props.history.push('/')
        }
      }

      formClear = (e) =>{
          this.setState({
            name: '',
            email: '',
            title: '',
            max_app: 1,
            max_pos: 1,
            req_skills: [],
            type: 'F',
            duration: 0,
            salary: 0,
            deadline: todayDate()
          })
      }



    render() {

        
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div>
                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="success">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>

                <Container style={{marginTop:'3rem'}}>
                    <Row className="justify-content-md-center">
                    <h1 style={{fontSize:'450%'}}>Enter the details below to</h1>
                    <h1 style={{fontSize:'450%'}}> Create A Job</h1>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Container style={{border:'2px solid orange' , borderRadius:'7%'  ,height:'530px'}}>
                        <Form onSubmit={this.handleSubmit} style={{marginTop:'2rem' , marginLeft:'2rem' , marginRight:'2rem'}}>
                            <Form.Row>
                                <Form.Group as={Col}>
                                <Form.Label>Job Title</Form.Label>
                                <Form.Control value={this.state.title} onChange={this.onChange} name="title" type="text" required placeholder="Enter Title" />
                                </Form.Group>

                                <Form.Group as={Col}>
                                <Form.Label>Job Type</Form.Label>
                                <Form.Control required value={this.state.type} onChange={this.onChange} name="type" as="select">
                                    <option value="F">Full Time</option>
                                    <option value="P">Part Time</option>
                                    <option value="H">Work from Home</option>
                                </Form.Control>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row>
                                <Form.Group as={Col}>
                                <Form.Label>Duration(in months)</Form.Label>
                                <Form.Control required value={this.state.duration} onChange={this.onChange} name="duration" type="number" min={0} max={6}/>
                                </Form.Group>

                                <Form.Group as={Col}>
                                <Form.Label>Salary per Month (Rs.)</Form.Label>
                                <Form.Control required value={this.state.salary} onChange={this.onChange} name="salary" type="number" min={0} step={500}/>
                                </Form.Group>

                            </Form.Row>

                            <Form.Row>
                                <Form.Group as={Col}>
                                <Form.Label>Max Applications allowed</Form.Label>
                                <Form.Control required value={this.state.max_app} onChange={this.onChange} name="max_app" type="number"  min={1}/>
                                </Form.Group>

                                <Form.Group as={Col}>
                                <Form.Label>Max Positions available</Form.Label>
                                <Form.Control required value={this.state.max_pos} onChange={this.onChange} name="max_pos" type="number" min={1} />
                                </Form.Group>

                            </Form.Row>

                            <Form.Group xs={12}  as={Col}>
                            <Select 
                              className="dropdown" 
                              placeholder="Select required skills"  
                              options={predefSkills} 
                              value={predefSkills.filter(obj => this.state.req_skills.includes(obj.label))}
                              onChange={this.onSkillChange}
                              isMulti/>
                            </Form.Group>

                            <Form.Group xs={12}  as={Col}>
                                <Form.Label>Select Deadline to Apply</Form.Label>
                                <Form.Control required value={this.state.deadline} name="deadline" onChange={this.onChange}  type="date" placeholder="Deadline Date" />
                            </Form.Group>
                            
                            <Form.Row style={{marginTop:'2rem'}} className="d-flex justify-content-center">
                            <Form.Group  className="d-flex justify-content-end" xs={6}  as={Col}>
                            <Button variant="contained" style={{backgroundColor:'yellow'}} startIcon={<AddIcon/>} type="submit">
                                Create
                            </Button>
                            </Form.Group>
                            
                            <Form.Group xs={6} className="d-flex justify-content-start"  as={Col}>
                            <Button  variant="contained" style={{backgroundColor:'red'}} type="button" onClick={this.formClear}>
                                <span style={{color:'white'}}>Clear</span>
                            </Button>
                            </Form.Group>
                            </Form.Row>
                        </Form>
                        </Container>
                    </Row>
                </Container>
                
            </div>
        )
    }
}



export default RecCreate