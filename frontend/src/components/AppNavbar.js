import React , {Component} from 'react'
import UserContext from '../context/UserContext'
import{
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container
} from 'reactstrap'
import {NavLink as RRNavLink} from 'react-router-dom'

export default class AppNavbar extends Component{
    state = {
        isOpen : false
    }

    static contextType = UserContext

    toggle = () =>{
        this.setState({
            isOpen : !this.state.isOpen
        })
    }

    logOut = () => {
        this.context.logOut()
        localStorage.removeItem('token')
    }

    render(){
        console.log(this.context)
        return(
            <div>
            <Navbar color="primary"  light  expand="sm" className="mb-2">
                <Container>
                    <NavbarBrand style={{color:'white'}} href="/">Job Portal</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}></NavbarToggler>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            {
                                !this.context.isAuthenticated ? 
                                (
                                    <>
                                    <NavItem style={{marginRight:'1.5rem'}}>
                                        <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}}  to='/register'>Register</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}}   to='/login'>Login</NavLink>
                                    </NavItem>
                                    </>
                                ) : 
                                (
                                    <>
                                    {this.context.user.type === 'Applicant' ? (
                                        <>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}}  to='/appApps'>My Applications</NavLink>
                                        </NavItem>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/appJobs'>Job Listings</NavLink>
                                        </NavItem>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/appProfile'>My Profile</NavLink>
                                        </NavItem>
                                        </>
                                    ): (
                                        <>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/recJobs'>My Jobs</NavLink>
                                        </NavItem>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/recEmployees'>My Employees</NavLink>
                                        </NavItem>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/recProfile'>My Profile</NavLink>
                                        </NavItem>
                                        <NavItem style={{marginRight:'1.5rem'}}>
                                            <NavLink tag={RRNavLink} style={{color:'white'}} activeStyle={{color:'#ccffff' , fontSize:'1.5rem' , marginBottom:'-1rem' , marginTop:'-0.5rem'}} to='/recCreate'>Create Job</NavLink>
                                        </NavItem>
                                        </>
                                    )}
                                    <NavItem style={{marginRight:'1.5rem'}}>
                                        <NavLink tag={RRNavLink} style={{color:'white'}} onClick={this.logOut} to='/'>Logout</NavLink>
                                    </NavItem>
                                    </>
                                )
                            }
                            
                        </Nav>
                    </Collapse>
                </Container>
            </Navbar>
        </div>
        )
        
    }
}