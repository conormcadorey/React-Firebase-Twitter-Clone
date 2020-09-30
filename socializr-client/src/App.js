import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'; //npm i react-router-dom
import './App.css';
//import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import themeFile from './util/theme';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

//redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_AUTHENTICATED } from './redux/types';
import { logoutUser, getUserData } from './redux/actions/userActions';

//components
import Navbar from './components/Navbar';
import AuthRoute from './util/AuthRoute';

//pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

//theme 
const theme = createMuiTheme(themeFile);

//Use user token to check if session time has expired or not 
//Decode user token 
const token = localStorage.FBIdToken;
//if there is no token = 'undefined' = false 
//if there is a token- decode it
//inside the decoded token is an expiry date
if (token) {
  //use jwdDecode to decode token
  const decodedToken = jwtDecode(token);
  //compare token with current time to check if expired 
  if(decodedToken.exp * 1000 < Date.now()){
    //delete token and log out 
    store.dispatch(logoutUser())
    window.location.href = '/login';
  } else {
    store.dispatch({ type: SET_AUTHENTICATED });
    //reinitiate axios headers on page refresh
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render() {
    return (
      //insert routes here
      //must add a switch
      //everything must be wrapped in 'Router' tags
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Router>
          <Navbar/>
            <div className="container">
              <Switch>
                <Route exact path="/" component={home} /> 
                <AuthRoute exact path="/login" component={login}/> 
                <AuthRoute exact path="/signup" component={signup}/> 
              </Switch>
            </div>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;

