import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../util/MyButton';

//redux
import { connect } from 'react-redux';
import { editUserDetails } from '../redux/actions/userActions';

// MUI 
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Icons
import EditIcon from '@material-ui/icons/Edit';
 
const styles = (theme) => ({
    ...theme.spreadThis,
    button: {
        float: 'right'
      }
});

class EditDetails extends Component {
    //init state
    state = {
        bio: '',
        website: '',
        location: '',
        open: false //dialog window closed by default
    };

    mapUserDetailsToState = (credentials)=> {
        this.setState({
            //check what output to display depending if bio is empty or not 
            bio: credentials.bio ? credentials.bio : '',
            website: credentials.website ? credentials.website : '',
            location: credentials.location ? credentials.location : ''
        });
    }

    //set dialog window state to open/true
    handleOpen = () => {
        this.setState( { open: true }); 
        this.mapUserDetailsToState(this.props.credentials);
    }

    //set dialog window state to closed/false
    handleClose = () => {
        this.setState({ open: false });
    }

    //set the users current information values when component mounts
    componentDidMount(){
        const { credentials } = this.props; //detructure credentials
        this.mapUserDetailsToState(credentials);
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = () => {
        const userDetails = {
            bio: this.state.bio,
            website: this.state.website,
            location: this.state.location
        };
        //call the action
        this.props.editUserDetails(userDetails);
        this.handleClose(); //close dialog window on submit
    }

    render() {
        const { classes } = this.props; //destructure

        return (
            <Fragment>
                <MyButton tip="Edit details" onClick={this.handleOpen} btnClassName={classes.button}>
                    <EditIcon color="primary"/>
                </MyButton>

                <Dialog 
                    open={this.state.open}
                    onClose={this.handleClose}
                    fullWidth
                    maxWidth="sm"
                    >  

                    <DialogTitle>Edit your details</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField 
                            name="bio" 
                            type="text" 
                            label="Bio" 
                            multiline rows="3" 
                            placeholder="Tell us all about you!"
                            className={classes.textField}
                            value={this.state.bio}
                            onChange={this.handleChange}
                            fullWidth>
                            </TextField>

                            <TextField 
                            name="website" 
                            type="text" 
                            label="Website" 
                            placeholder="Your website"
                            className={classes.textField}
                            value={this.state.website}
                            onChange={this.handleChange}
                            fullWidth>
                            </TextField>

                            <TextField 
                            name="location" 
                            type="text" 
                            label="Location" 
                            placeholder="Your secret lair"
                            className={classes.textField}
                            value={this.state.location}
                            onChange={this.handleChange}
                            fullWidth>
                            </TextField>
                        </form>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>

                </Dialog>
            </Fragment>
        );
    }
}

EditDetails.propTypes = {
    editUserDetails: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    credentials: state.user.credentials
})

export default connect(mapStateToProps, { editUserDetails })(withStyles(styles)(EditDetails));

