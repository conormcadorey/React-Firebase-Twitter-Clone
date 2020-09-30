import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; //plugin for dayjs 
import PropTypes from 'prop-types';
import MyButton from '../util/MyButton';
import DeleteScream from './DeleteScream';
import ScreamDialog from './ScreamDialog';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

//redux
import { connect } from 'react-redux';
import { likeScream, unlikeScream } from '../redux/actions/dataActions';

//icons
import ChatIcon from "@material-ui/icons/Chat";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";

const styles = {
    card: {
        position: 'relative',
        display: 'flex',
        marginBottom: 20
    },    
    image: {
        minWidth: 200
    },
    content: {
        padding: 25,
        objectFit: 'cover' //prevent image stretching etc
    }
}

class Scream extends Component {

    likedScream = () => {
        //check if liked already 
        //find() with return underfined if it cant find anything = condition false
        if(this.props.user.likes && this.props.user.likes.find(like => like.screamId === this.props.scream.screamId))
        return true;
        else return false;
    };

    likeScream = () => {
        this.props.likeScream(this.props.scream.screamId);
    }

    unlikeScream = () => {
        this.props.unlikeScream(this.props.scream.screamId);
    }

    render() {
        //dayjs
        dayjs.extend(relativeTime)
        //the scream is inside props
        //properities from an object inside props can be further destructured
        const { 
            classes, 
            scream: { 
                body, 
                createdAt, 
                userImage, 
                userHandle, 
                screamId, 
                likeCount, 
                commentCount 
            },
            user: {
                authenticated, credentials: { handle}
            }
        
        } = this.props; // equivalent of 'const classes = this.props.classes' - calles destructuring
        
        //create like button 
        //if not authenticated user show this button
        const likeButton = !authenticated ? (
            <MyButton tip="Like">
                <Link to="/login">
                    <FavoriteBorder color="primary"/>
                </Link>
            </MyButton>
        ) : (
            //else if authenticated user show this button
            this.likedScream() ? ( //if returns true= user already liked scream
                <MyButton tip="Unlike" onClick={this.unlikeScream}>
                    <FavoriteIcon color="primary"/>
                </MyButton>
            ) : ( //else show this button
                <MyButton tip="Like" onClick={this.likeScream}>
                    <FavoriteBorder color="primary"/>
                </MyButton>
            )
        )

        const deleteButton =
            authenticated && userHandle === handle ? (
                <DeleteScream screamId={screamId} />
            ) : null; //else dont render anything

        return (
            <Card className={classes.card}>
                <CardMedia 
                image={userImage}
                title="profile image" className={classes.image}/>
                <CardContent className={classes.content}>
                    <Typography variant="h5" 
                    component={Link} to={`/users/${userHandle}`}
                    color="primary">
                    {userHandle}
                    </Typography>
                    {deleteButton}
                    <Typography variant="body2" color="textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography variant="body1">{body}</Typography>
                    {likeButton}
                    <span>{likeCount} Likes </span>
                    <MyButton tip="comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{commentCount} comments</span>
                    <ScreamDialog screamId={screamId} userHandle={userHandle}/>
                </CardContent>
            </Card>
        )
    }
}

Scream.propTypes = {
    likeScream: PropTypes.func.isRequired,
    unlikeScream: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    scream: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    user: state.user
})

const mapActionsToProps = {
    likeScream,
    unlikeScream
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Scream));