import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux'; //connect component to state
import PropTypes from 'prop-types';


//redirect users depending on login status 
const AuthRoute = ({ component: Component, authenticated, ...rest }) => (
    <Route
    {...rest} //spread rest props
    render={(props) => authenticated === true ? <Redirect to='/'/> : <Component {...props}/>
    }
    />
);

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated
});

AuthRoute.propTypes = {
    user: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(AuthRoute);