//const { ReactComponent } = require("*.svg");
import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types'; //good practice to use propTypes- helps with error checking props
import AppIcon from '../images/icon.png';
import { Link } from 'react-router-dom';

//MUI
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

//redux
import { connect } from 'react-redux';
import { signupUser } from '../redux/actions/userActions';

const styles = (theme) => ({
    ...theme.spreadThis
  });

/*
const styles = {
    form: {
        textAlign: 'center'
    },
    images: {
        margin: '20px auto 20px auto'
    },
    pageTitle: {
        margin: '10px auto 10px auto'
    },
    textField: {
        margin: '10px auto 10px auto'
    },
    button: {
        marginTop: 20,
        position: 'relative'
    },
    customError: {
        color: 'red',
        fontSize: '0.8rem'
    },
    progress: {
        position: 'absolute'
    }
};
*/

class signup extends Component {
    //we will use controlled components to handle forms
    constructor(){
        super();
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            handle: '',
            errors: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        //get errors and set to local errors
        if(nextProps.UI.errors){
            this.setState({ errors: nextProps.UI.errors });
        }
    }

    handleSubmit = (event) => {
        //prevent default behaviour
        event.preventDefault();
        //set loading status: true
        this.setState({
            loading: true
        });
        //userdata object
        //bind values to state
        const newUserData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.password,
            handle: this.state.handle
        };

        //pass history- to redirect
        this.props.signupUser(newUserData, this.props.history);
    }
    
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value //eg the form item name: 'email' or 'password' 
        });
    }

    render() {
        //destructure classes from props
        //get loading from props
        const { classes, UI: { loading } } = this.props;
        const { errors } = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm/>
                <Grid item sm>
                    <img src={AppIcon} alt="favicon" className={classes.image}/>
            <Typography variant="h1" className={classes.pageTitle}>
                Signup
            </Typography>
            <form noValidate onSubmit={this.handleSubmit}>

            <TextField 
                id="email" 
                name="email" 
                type="email" 
                label="Email" 
                className={classes.textField}
                helperText={errors.email}
                error={errors.email ? true : false} //if email key is in the errors array- true 
                value={this.state.email} 
                onChange={this.handleChange} 
                fullWidth/>

                <TextField 
                id="password" 
                name="password" 
                type="password" 
                label="Password" 
                className={classes.textField}
                helperText={errors.password}
                error={errors.password ? true : false}
                value={this.state.password} 
                onChange={this.handleChange} 
                fullWidth/>

                <TextField 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                label="confirm Password"
                className={classes.textField}
                helperText={errors.confirmPassword}
                error={errors.confirmPassword ? true : false}
                value={this.state.confirmPassword} 
                onChange={this.handleChange} 
                fullWidth/>

                <TextField 
                id="handle" 
                name="handle"
                type="text" 
                label="Handle"
                className={classes.textField}
                helperText={errors.handle}
                error={errors.handle ? true : false}
                value={this.state.handle} 
                onChange={this.handleChange} 
                fullWidth/>

                {errors.general && (
                    <Typography variant="body2" className={classes.customError}>
                        {errors.general}
                    </Typography>
                )}

                <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                className={classes.button}
                disabled={loading}>

                Signup
                
                {loading && (
                    <CircularProgress size={30} className={classes.progress}/>
                )}
                    
                </Button>

                <br /><br />

                <small>Already have an account? Login <Link to="/login">here</Link></small>

            </form>
                </Grid>
                <Grid item sm/>
            </Grid>
        );
    }
}

signup.propTypes = {
    classes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
    signupUser: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
});

export default connect(mapStateToProps, { signupUser })(withStyles(styles)(signup));