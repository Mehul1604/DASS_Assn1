import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Container ,Grid , Paper , TextField} from '@material-ui/core'
import {Button} from 'react-bootstrap'
import ReceiptIcon from '@material-ui/icons/Receipt';
import WorkIcon from '@material-ui/icons/Work';
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';

// import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
// import {loadUser} from '../actions/authActions'

class RecruiterProfile extends Component {
    
    static contextType = UserContext

    state = {
        name: null,
        email: null,
        contact: null,
        bio: null,
        employees: null,
        jobs: null,
        loading: true,
        canEditName: false,
        canEditContact: false,
        canEditBio: false
    }

    // nameRef = React.createRef()

    componentDidMount(){
        const getRecruiter = async (token) => {
            try{
                console.log('making axios now'  )
                const recruiter = await axios.get('/api/auth/rec/user' , {headers: {'x-auth-token' : token}})
                this.setState({
                    name: recruiter.data.name,
                    email: recruiter.data.name,
                    contact: recruiter.data.contact,
                    bio: recruiter.data.bio,
                    employees: recruiter.data.employees.length,
                    jobs: recruiter.data.job_ids.length
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
        
        getRecruiter(this.context.token)
    }

    onNameChange = (e) =>{
        this.setState({name: e.target.value})
    }

    onContactChange = (e) =>{
        this.setState({contact: e.target.value})
    }

    onBioChange = (e) =>{
        this.setState({bio: e.target.value})
    }

    editName = () =>{
        this.setState({canEditName: true})
    }

    cancelName = () => {
        let origName = this.context.user.name
        this.setState({canEditName: false , name: origName})
    }

    editContact = () =>{
        this.setState({canEditContact: true})
    }

    editBio  = () =>{
        this.setState({canEditBio: true})
    }

    submitName = async (e) =>{
        e.preventDefault()
        this.setState({loading: true})
        console.log('NEW NAME IS' , this.state.name)
        this.setState({canEditName: false})
        const body = {name: this.state.name}
        try{
            const changedNameRecruiter = await axios.post('/api/recruiters/profile' , body , {headers: {'x-auth-token': this.context.token}})
            this.context.changeName(changedNameRecruiter.data.name)
        }
        catch(err){
            console.log(err)
        }
        finally{
            this.setState({loading: false})
        }
        
    }

    submitContact = async (e) =>{
        e.preventDefault()
        this.setState({loading: true})
        console.log('NEW CONTACT IS' , this.state.contact)
        this.setState({canEditContact: false})
        const body = {contact: this.state.contact}
        try{
            await axios.post('/api/recruiters/profile' , body , {headers: {'x-auth-token': this.context.token}})
        }
        catch(err){
            console.log(err.response.data)
        }
        finally{
            this.setState({loading: false})
        }
        
    }

    submitBio = async () =>{
        this.setState({loading: true})
        console.log('NEW BIO IS' , this.state.bio)
        this.setState({canEditBio: false})
        const body = {bio: this.state.bio}
        try{
            await axios.post('/api/recruiters/profile' , body , {headers: {'x-auth-token': this.context.token}})
        }
        catch(err){
            console.log(err.response.data)
        }
        finally{
            this.setState({loading: false})
        }
        
    }

    

    render() {
        // console.log(this.context)
        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div className="container" style={{  marginTop:'2rem'}}>
                  
                <Grid container spacing={5}>
                    <Grid style={{paddingLeft:'2rem'}} item xs={5}>
                        <Grid style={{borderRight:'2px solid black'}} container direction='column' justify='center' alignItems='flex-start' spacing={3}>
                            <Grid  item>
                                <div>
                                    <h3>Name</h3>
                                    <form onSubmit={this.submitName}>
                                    <TextField required InputProps={{readOnly: !this.state.canEditName}} value={this.state.name} onChange={this.onNameChange}   variant='outlined'/>
                                    {!this.state.canEditName ? (<Button variant="primary" key="edit-button-contact" onClick={this.editName} style={{marginTop:'1rem' , marginLeft:'1rem'}}>Edit</Button>) : (
                                    <>
                                    <Button variant="success" key="name-submit" type="submit" style={{marginTop:'1rem' , marginLeft:'1rem'}}>Submit</Button>
                                    <Button variant="danger" key="name-cancel" type="button" onClick={this.cancelName} style={{marginTop:'1rem' , marginLeft:'1rem'}}>Cancel</Button>
                                    </>
                                    )}
                                    </form>
                                </div>
                            </Grid>
                            <Grid  item>
                                <div>
                                <h3>Email</h3>
                                    {this.state.email}
                                </div>
                            </Grid> 
                            
                            <Grid item>
                                <h3>Employees</h3>
                                {this.state.employees}
                            </Grid>
                            
                        </Grid>
                    </Grid>
                    <Grid  item xs={7}>
                        <Grid  container direction='column' justify='center' alignItems='flex-start' spacing={3}>
                            <Grid item>
                                <h3>Contact</h3>
                                <form onSubmit={this.submitContact}>
                                <TextField required inputProps={{pattern: '[0-9]{10}'}} InputProps={{readOnly: !this.state.canEditContact}} value={this.state.contact} onChange={this.onContactChange}   variant='outlined'/>
                                {!this.state.canEditContact ? (<Button type="button" variant="primary" key="edit-button-contact" onClick={this.editContact} style={{marginTop:'1rem' , marginLeft:'1rem'}}>Edit</Button>) : (<Button type="submit" variant="success" key="submit-contact"  style={{marginTop:'1rem' , marginLeft:'1rem'}}>Submit</Button>)}
                                </form>
                            </Grid>
                            <Grid item>
                                <h3>Bio</h3>
                                <TextField  InputProps={{readOnly: !this.state.canEditBio}} value={this.state.bio} onChange={this.onBioChange}   variant='outlined'/>
                                {!this.state.canEditBio ? (<Button key="edit-bio" variant="primary" type="button" onClick={this.editBio} style={{marginTop:'1rem' , marginLeft:'1rem'}}>Edit</Button>) : (<Button key="submit-bio" variant="success" type="button" onClick={this.submitBio} style={{marginTop:'1rem' , marginLeft:'1rem'}}>Submit</Button>)}
                            </Grid>
                            <Grid item>
                                <h3>Jobs</h3>
                                {this.state.jobs}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                
           </div>
        )
    }
}

// const mapStateToProps = (state) =>({
//     isAuthenticated: state.auth.isAuthenticated,
//     user: state.auth.user,
//     error: state.error
// })

export default RecruiterProfile