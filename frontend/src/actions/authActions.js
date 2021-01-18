import axios from 'axios'
import {USER_LOADED , AUTH_ERROR , LOGIN_SUCCESS , LOGIN_FAIL , LOGOUT_SUCCESS , REGISTER_SUCCESS , REGISTER_FAIL} from './types'
import {returnErrors , clearErrors} from './errorActions'


export const loadUser = () => (dispatch,getState) =>{
    //User loading
    axios.get('/api/auth/app/user' ,  tokenConfig(getState))
            .then(res => {
                console.log('Gonna send' , res.data)
                dispatch({
                type: USER_LOADED,
                payload: res.data
            })})
            .catch(err => {
                if(err.response.data.msg === 'User does not exist'){
                    axios.get('/api/auth/rec/user' , tokenConfig(getState))
                        .then(res => dispatch({type: USER_LOADED , payload: res.data}))
                        .catch(err => {
                            dispatch(returnErrors(err.response.data.msg , err.response.status , 'AUTH_ERROR'))
                            dispatch({type: AUTH_ERROR})
                        })
                }
                else{
                    dispatch(returnErrors(err.response.data.msg , err.response.status))
                    dispatch({type: AUTH_ERROR})
                }
            })
}

export const register = (regUser , type) => dispatch  =>{
    // Headers
    console.log('func entered')
    const config = {
        headers: {
            'Content-type' : 'application/json'
        }
    }

    if(type === 'Applicant'){

        const newApplicant = {
            name: regUser.name,
            email: regUser.email,
            password: regUser.password
        }

        console.log('gonna post this applicant rn')
        axios.post('/api/applicants' , newApplicant)
            .then(res => dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            }))
            .catch(err => {
                dispatch(returnErrors(err.response.data.msg , err.response.status , 'REGISTER_FAIL'))
                dispatch({
                    type: REGISTER_FAIL
                })
            })
    }
    else{
        const newRecruiter = {
            name: regUser.name,
            email: regUser.email,
            password: regUser.password,
            contact: regUser.contact,
            bio: regUser.bio
        }
        
        axios.post('/api/recruiters' , newRecruiter)
            .then(res => dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            }))
            .catch(err => {
                dispatch(returnErrors(err.response.data.msg , err.response.status , 'REGISTER_FAIL'))
                dispatch({
                    type: REGISTER_FAIL
                })
            })

    }
}

export const setNull = () => dispatch =>{
    dispatch(clearErrors())
    dispatch({
        type: REGISTER_FAIL
    })
}

//Login User

export const login = ({email , password}) => dispatch =>{
    // Headers
    const config = {
        headers: {
            'Content-type' : 'application/json'
        }
    }

    //Req body

    const loginUser = {
        email,password
    }

    axios.post('/api/auth/app' , loginUser)
            .then(res => dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            }))
            .catch(err => {
                if(err.response.data.msg === 'User does not exist'){
                    axios.post('/api/auth/rec' , loginUser)
                        .then(res => dispatch({type: LOGIN_SUCCESS , payload: res.data}))
                        .catch(err => {
                            dispatch(returnErrors(err.response.data.msg , err.response.status , 'LOGIN_FAIL'))
                            dispatch({type: LOGIN_FAIL})
                        })
                }
                else{
                    dispatch(returnErrors(err.response.data.msg , err.response.status , 'LOGIN_FAIL'))
                    dispatch({type: LOGIN_FAIL})
                }
            })

    // axios.post('/api/auth' , body , config)
    //     .then(res => dispatch({
    //         type: LOGIN_SUCCESS,
    //         payload: res.data
    //     }))
    //     .catch(err =>{
    //         dispatch(returnErrors(err.response.data , err.response.status , 'LOGIN_FAIL'));
    //         dispatch({
    //             type: LOGIN_FAIL
    //         })
    //     })
}

export const tokenConfig = getState =>{
    //get token from localstorage
    const token = getState().auth.token
    // Headers
    const config = {
        headers: {
            "Content-type" : "application/json"
        }
    }

    //If token then add to header

    if(token){
        config.headers['x-auth-token'] = token
    }

    return config
}