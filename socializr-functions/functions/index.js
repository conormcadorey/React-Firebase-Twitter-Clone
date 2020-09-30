const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin');

const { db } = require('./util/admin');
 
//express
//use express to simplify API routing
const app = require('express')();

const FBAuth = require('./util/fbAuth');

//call handler functions
const { 
    getAllScreams, 
    postOneScream, 
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream } = require('./handlers/screams');

const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead } = require('./handlers/users');

//||||||||||||||ROUTES||||||||||||||
//use express
//first param- name of route
//second param-the handler 
//middlewear- FBAuth creates a portected route- only allows access via an auth token
//GET SCREAMS
app.get('/screams', getAllScreams);
//POST A SCREAM
app.post('/scream', FBAuth, postOneScream);
//GET ONE SCREAM
app.get('/scream/:screamId', getScream);
//COMMENT ON SCREAM
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
//LIKE SCREAM
app.get('/scream/:screamId/like', FBAuth, likeScream);
//UNLIKE SCREAM
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
//DELETE SCREAM
app.delete('/scream/:screamId', FBAuth, deleteScream);

//SIGN UP ROUTE
app.post('/signup', signup);
//LOGIN ROUTE
app.post('/login', login);
//IMAGES ROUTE
app.post('/user/image', FBAuth, uploadImage);
//ADDITIONAL USER DETAILS ROUTE
app.post('/user', FBAuth, addUserDetails);
//GET USER DETAILS
//seperate from login route to shorten login time- these details can be fetched after logging in 
app.get('/user', FBAuth, getAuthenticatedUser);
//pass user handle to get their full details
app.get('/user/:handle', getUserDetails);
//Mark notifications as read
app.post('/notifications', FBAuth, markNotificationsRead);

//tell firebase that 'app' is the container for our routes so it works properly
//this creates one centralised routing through 'api'
//to access a specific api- format https://us-central1-socializr-ee488.cloudfunctions.net/api/NAME-OF-API
exports.api = functions.region('europe-west1').https.onRequest(app);

//NOTIFICATIONS
//use firebase database triggers to help create notifications

//notification .onCreate() - when a like document has been created send a notification
exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('likes/{id}')
.onCreate((snapshot) => {

    //get the document
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then((doc) => {
        //check doc exists
        //check that user won't get a notification if liking their own statement
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            //create notification 
            //give notification same id as like/comment
            //make the id of the like and of the notification the same
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString,
                recipeient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'like',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => 
        console.error(err));
});


//delete notification on un-like
exports.deleteNotificationOnUnlike = functions.region('europe-west1').firestore.document('likes/{id}')
.onDelete((snapshot) => {

    return db.doc(`/notifications/${snapshot.id}`)
    .delete()
        .catch(err => {
            console.error(err);
        });
});


//notification on new comment added
exports.createNotificationOnComment = functions.region('europe-west1').firestore.document('comments/{id}')
.onCreate((snapshot) => {

    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            //create notification 
            //give notification same id as like/comment
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString,
                recipeient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'comment',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => {
        console.error(err);
        return;
    });
});

//if user changes profile img- change the img url in all stored instances on the db 
//uses db triggers
exports.onUserImageChange = functions
  .region('europe-west1')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    //change snapshot has 2 values- before and after
    //run function only if the profile image has been changed
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      //batch write as mutiple docs may be changes
      const batch = db.batch();
      return db
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

//if a user deletes a scream, use db triggers to delete associated like/comment documents
exports.onScreamDelete = functions
  .region('europe-west1')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => { //only need the context
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });