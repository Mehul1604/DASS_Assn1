import React , {Component} from 'react'
import {BrowserRouter as Router, Route , Switch} from "react-router-dom";
import axios from 'axios'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from './components/Register'
import Home from './components/Home'
import AppNavbar from './components/AppNavbar'
import Login from './components/Login'
import UserContext from './context/UserContext'
import Loader from 'react-loader-spinner'
import ApplicantProfile from './components/ApplicantProfile';
import RecruiterProfile from './components/RecruiterProfile';
import AppJobs from './components/AppJobs'
import AppApplications from './components/AppApplications';
import RecCreate from './components/RecCreate'
import RecJobs from './components/RecJobs'
import JobApps from './components/JobApps';
// import {Provider} from 'react-redux'
// import store from './store'

class App extends Component{

  state = {
            token: null,
            isAuthenticated: false,
            user: null,
            userLoading: true
        }
    
  setUser = (token , isAuthenticated , user) =>{
      console.log('gonna set user as ' , user)
      this.setState({
          token: token,
          isAuthenticated: isAuthenticated,
          user: user
      })
  }

  changeName = (name) =>{
    console.log('CHANGING CONTEXT NAME TO' , name)
    const newNameUser = {...this.state.user , name: name}
    this.setState({
      user: newNameUser
    })
  }

  logOut = () =>{
    
      this.setState({
          token: null,
          isAuthenticated: false,
          user: null
      })
      localStorage.removeItem('token')
  }
  
  componentDidMount(){
    const checkLoggedIn = async () =>{

      try{
          const token = localStorage.getItem('token')
          const tokenRes = await axios.post('/api/tokenValid' , null , {headers: {'x-auth-token': token}})
          console.log(tokenRes.data)

          if(tokenRes.data){
            const userRes = await axios.get('/api/user' , {headers: {'x-auth-token': token}})
            console.log(userRes.data)
            this.setUser(token , true , userRes.data)
        }
      }
      catch(err){
        console.log(err.message)
      }
      finally{
        this.setState({userLoading: false})
      }
      
      
    }

    checkLoggedIn()
  }
  

  render(){
    
    console.log('FULL APP STATE LOOKS LIKE',this.state)
    const {token , isAuthenticated , user} = this.state
    const {setUser , logOut , changeName} = this
    return (
      <Router>
          <UserContext.Provider value = {{
              token,
              isAuthenticated,
              user,
              setUser,
              logOut,
              changeName
          }}>
            {this.state.userLoading ? <Loader type="Circles" color='blue' radius height={200} width={200} style={{marginLeft:'43%' , marginTop:'20%'}}/>: (
              <>
              <AppNavbar/>
              <Switch>
                  <Route path="/" exact component={Home}/>
                  <Route path="/register" component={Register}/>
                  <Route path="/login" component={Login}/>
                  <Route path="/appProfile" component={ApplicantProfile}/>
                  <Route path="/recProfile" component={RecruiterProfile}/>
                  <Route path="/appJobs" component={AppJobs}/>
                  <Route path="/appApps" component={AppApplications}/>
                  <Route path="/recCreate" component={RecCreate}/>
                  <Route path="/recJobs" component={RecJobs}/>
                  <Route path="/jobApps/:job_id" component={JobApps}/>
              </Switch>
              </>
            )}
            
          </UserContext.Provider>
    </Router>
    )
  }
}

export default App;

