import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED, LOADING_USER } from '../types';
import axios from 'axios';

//login action
//use dispatch for asyncronous code 
//history = pass the history from the component (login.js) to the action 
export const loginUser = (userData, history) => (dispatch) => {
    //this is where the action is sent 
    //action has a type
    dispatch({ type: LOADING_UI });

    //send request to server
        //use axios
        axios.post('/login', userData)
        .then(res => {
            setAuthorizationHeader(res.data.token)
            //dispatches
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS}); 
            //push redirect to home page 
            history.push('/');
        })
        .catch(err => {
                //dispatch an action 
                dispatch({
                    type: SET_ERRORS,
                    payload: err.response.data
            })
        });
}

//signup action
export const signupUser = (newUserData, history) => (dispatch) => {

    dispatch({ type: LOADING_UI });

        axios.post('/signup', newUserData)
        .then(res => {
            setAuthorizationHeader(res.data.token)
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS}); 
            history.push('/');
        })
        .catch(err => {
                dispatch({
                    type: SET_ERRORS,
                    payload: err.response.data
            })
        });
}

//logout action
export const logoutUser = () => (dispatch) => {
    //remove auth token
    localStorage.removeItem('FBIdToken');
    //remove auth header from axios
    delete axios.defaults.headers.common['Authorization'];
    //clear out user state/return initial empty user state
    dispatch({ type: SET_UNAUTHENTICATED });
  };


//uses the user token
export const getUserData = () => (dispatch) => {
    dispatch({ type: LOADING_USER });
    //get user data
    axios.get('/user').then(res => {
        //dispatch an action on successful result
        dispatch({
            type: SET_USER,
            payload: res.data //the user data
        })
    })
    .catch(err => console.log(err));
}

export const uploadImage = (formData) => (dispatch) => {
    dispatch({ type: LOADING_USER })
    axios.post('/users/image', formData)
    .then(() => {
        dispatch(getUserData());
    })
    .catch(err => console.log(err));
}

//function that sends req to edit user details
export const editUserDetails = (userDetails) => (dispatch) => {
    dispatch({ type: LOADING_USER });
    axios.post('/user', userDetails)
    .then(() => {
        dispatch(getUserData());
    })
    .catch(err => console.log(err));
}

//create helper function to prevent code repitition 
const setAuthorizationHeader = (token) => {
    //store access token in local storage for easy access
    const FBIdToken = `Bearer ${token}`;
    localStorage.setItem('FBIdToken', FBIdToken);
    //use axios headers for protected routes access with token
    //each time a request is send thru axios- the auth header will have the token as a value
    axios.defaults.headers.common['Authorization'] = FBIdToken;
}