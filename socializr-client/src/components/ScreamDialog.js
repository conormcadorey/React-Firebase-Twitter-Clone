import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../util/MyButton';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

//MUI
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

//icons
import CloseIcon from '@material-ui/icons/Close';

//redux
import { connect } from 'react-redux';
import { getScream } from '../redux/actions/dataActions';

const styles ={  

}

class ScreamDialog extends Component {

}

ScreamDialog.propTypes = {

    getScream: PropTypes.func.isRequired,
    screamId: PropTypes.string.isRequired,
    userHandle: PropTypes.string.isRequired,
    scream: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,

}

const mapStateToProps = state => ({
    scream: state.data.scream,
    UI: state.UI
})

const mapActionsToProps = {
    getScream
};

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(ScreamDialog));

