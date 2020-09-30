//const { ReactComponent } = require("*.svg");
import React, { Component } from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

import Scream from '../components/Scream';
import Profile from '../components/profile';

import { connect } from 'react-redux';
import { getScreams } from '../redux/actions/dataActions';

class home extends Component {
    //use axios
    //create an api url proxy in package.json for quick access during dev
    componentDidMount() {
        //send a req to screams
        this.props.getScreams();
    }

    render() {
        const { screams, loading } = this.props.data;
        //show screams if not loading
        let recentScreamsMarkup = !loading ? (
        //in React when looping thru an array to show data- each child should have a key property 
        screams.map(scream => 
            <Scream key={scream.screamId} scream={scream}/>)
        ) : (
        
        <p>loading...</p>

        );

        return (
            <Grid container /*spacing={16}*/>
                <Grid item sm={8} xs={12}>
                    {recentScreamsMarkup}
                </Grid>

                <Grid item sm={4} xs={12}>
                    <Profile/>
                </Grid>
            </Grid>
        );
    }
}

home.propTypes = {
    getScreams: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    data: state.data
})

export default connect(mapStateToProps, { getScreams })(home);
