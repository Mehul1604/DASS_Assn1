import React, {Component} from 'react';
import {Grid , TextField , Snackbar} from '@material-ui/core'
import {Button , Form} from 'react-bootstrap'
import MuiAlert from '@material-ui/lab/Alert'
import UserContext from '../context/UserContext'
import axios from 'axios';
import Loader from 'react-loader-spinner';
import Resizer from 'react-image-file-resizer';



function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

class RecruiterProfile extends Component {
    
    static contextType = UserContext

    state = {
        name: null,
        email: null,
        contact: null,
        bio: null,
        employees: null,
        jobs: null,
        canUpload: false,
        file: null,
        base64: "",
        loading: true,
        canEditName: false,
        canEditContact: false,
        canEditBio: false,
        validOpen: false,
        errorMsg: ''
    }


    getRecruiter = async (token) => {
        try{
            console.log('making axios now'  )
            const recruiter = await axios.get('/api/auth/rec/user' , {headers: {'x-auth-token' : token}})
            this.setState({
                name: recruiter.data.name,
                email: recruiter.data.email,
                contact: recruiter.data.contact,
                bio: recruiter.data.bio,
                base64: recruiter.data.profile_img ? recruiter.data.profile_img : "",
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

    componentDidMount(){
       
        
        this.getRecruiter(this.context.token)
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

    // convert64 = (file) => {
    //     return new Promise((resolve , reject) => {
    //         const fileReader = new FileReader()
    //         fileReader.readAsDataURL(file)

    //         fileReader.onload = () =>{
    //             resolve(fileReader.result)
    //         }

    //         fileReader.onerror = (err) =>{
    //             reject(err)
    //         }
    //     })
    // }

    resizeFile = (file) => {
        return new Promise(resolve => {
            Resizer.imageFileResizer(file , 128 , 128 , 'JPEG' , 100 , 0 , uri => {
                resolve(uri);
            } , 
            'base64'
            );
        })
    }

    editPhoto = (e) =>{
        this.setState({canUpload: true})
    }

    chooseFile = (e) =>{
        this.setState({file: e.target.files[0]})
    }

    submitPhoto = async (e) =>{
        if(!this.state.file){
            this.setState({
                validOpen: true,
                errorMsg: 'No Image uploaded'
            })
            return
        }

        const base64 = await this.resizeFile(this.state.file)

        this.setState({loading: true , validOpen: false , errorMsg: '' , file: null , canUpload: false})
        const body = {
            base64: base64
        }
        try{
            await axios.post('api/recruiters/imgUpload' , body , {headers: {'x-auth-token': this.context.token}})
            this.getRecruiter(this.context.token)
        }
        catch(err){
            console.log(err.message)
        }
        
    }

    cancelPhoto = (e) =>{
        this.setState({canUpload: false , file: null})
    }

    delPhoto = async (e) =>{
        this.setState({loading: true , validOpen: false , errorMsg: '' , file: null , canUpload: false})
        const body = {
            base64: ""
        }
        try{
            await axios.post('api/recruiters/imgUpload' , body , {headers: {'x-auth-token': this.context.token}})
            this.getRecruiter(this.context.token)
        }
        catch(err){
            console.log(err.message)
        }
    }

    

    render() {

        return this.state.loading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/> : (
            <div className="container" style={{  marginTop:'2rem'}}>

                <Snackbar open={this.state.validOpen} autoHideDuration={5000} onClose={this.handleClose}>
                    <Alert onClose={this.handleClose} severity="error">
                    {this.state.errorMsg}
                    </Alert>
                </Snackbar>
                  
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
                            <Grid  item>
                                <div>
                                    <h3>Profile Picture</h3>
                                    {!(this.state.base64 === "") ? <img alt="profile_pic" src={this.state.base64} width="200px" height="200px"/> : "No Image Uploaded"}
                                    {!this.state.canUpload ? (
                                        <>
                                        
                                        <Button key="choose-photo" style={{marginLeft: '1rem'}} onClick={this.editPhoto} variant="primary">Upload/Change Profile Photo</Button>
                                        {!(this.state.base64 === "") ? <Button key="del-photo" onClick={this.delPhoto} style={{marginLeft: '1rem'}} variant="warning">Delete Photo</Button> : ""}
                                        </>
                                    ) : (
                                        <>
                                        <Form.Control style={{marginTop: '1rem'}} onChange={this.chooseFile} type="file"/>
                                        <Button style={{marginLeft: '1rem' , marginTop: '1rem'}} key="submit-photo" onClick={this.submitPhoto} variant="success">Upload</Button>
                                        <Button style={{marginLeft: '1rem' , marginTop: '1rem'}} key="cancel-photo" onClick ={this.cancelPhoto} variant="danger">Cancel</Button>
                                    </>
                                    )}
                                    
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                
           </div>
        )
    }
}



export default RecruiterProfile