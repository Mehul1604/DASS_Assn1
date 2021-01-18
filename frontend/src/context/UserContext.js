import React , {Component} from 'react'

const UserContext = React.createContext()

// export class UserProvider extends Component{
//     state = {
//         token: null,
//         isAuthenticated: false,
//         user: null
//     }

//     setUser = (token , isAuthenticated , user) =>{
//         this.setState({
//             token: token,
//             isAuthenticated: isAuthenticated,
//             user: user
//         })
//     }

//     logOut = () =>{
//         this.setState({
//             token: null,
//             isAuthenticated: false,
//             user: null
//         })
//     }

//     render(){
//         const {token , isAuthenticated , user} = this.state
//         const {setUser , logOut} = this
//         return(
            
//             <UserContext.Provider value={{
//                 token,
//                 isAuthenticated,
//                 user,
//                 setUser,
//                 logOut
//             }}>
//                 {this.props.children}
//             </UserContext.Provider>
//         )
//     }

// }

export default UserContext


