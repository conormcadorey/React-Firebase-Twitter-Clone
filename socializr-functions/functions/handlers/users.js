const { admin, db } = require('../util/admin');

const config = require('../util/config');

//import and initialize firebase application
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

exports.signup = (req, res) => {
    //extract data from form body 
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    //validation
    const { valid, errors } = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors);

    //default img
    const noImg = 'no-img.png';

    //declare variables
    let token, userId;

    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists) {
            return res.status(400).json({ handle: 'This handle is already taken!'});
        } else {
           return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then(data => {
        //return an access authentication token
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then(idToken => {
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            userId
        };
        //persist the above credentials into a document in usres collection
        db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({ token });
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use') {
            return res.status(400).json({ email: 'This email is already registered!'});
        } else {
            return res.status(500).json({general: 'Something went wrong, please try again'});
        }
    });
}

exports.login = (req, res) => {

    const user = {
        email: req.body.email,
        password: req.body.password
    };

    //validation
    const { valid, errors } = validateLoginData(user);
    if(!valid) return res.status(400).json(errors);

    
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json({token});
    })
    .catch(err => {
        console.error(err);
            return res.status(403).json({ general: 'Wrong credentials. Please try again!'});
    });
}

//add user details
exports.addUserDetails = (req, res) => {

    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
        return res.json({ message: 'Details updated!'});
    })
    .catch((err) => {
        console.error(err);
        return res.statys(500).json({ error: err.code });
    });
};

//get any users details
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.handle}`).get()
    .then(doc => {
        if(doc.exists) {
            userData.user = doc.data();
            return db.collection('screams')
            .where('userHandle', '==', req.params.handle)
            .orderBy('createdAt', 'desc')
            .get();
        } else {
            return res.status(404).json({ error: 'User not found!' });
        }
    })
    .then(data => {
        userData.screams = [];
        data.forEach(doc => {
            userData.screams.push({
                body: doc.data().body,
                createdAt: doc.data().createdAt,
                userHandle: doc.data().userHandle,
                userImage: doc.data().userImage,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount,
                screamId: doc.id
            })
        });
        return res.json(userData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    })
}

//get own user details
exports.getAuthenticatedUser = (req, res) => {

    //response data
    let userData = {};

    //get user
    db.doc(`/users/${req.user.handle}`).get()
    .then(doc => {
        //check if doc exists to prevent potential crashing 
        if(doc.exists) {
            userData.credentials = doc.data();
            //get likes
            return db.collection('likes').where('userHandle', '==', req.user.handle).get();
        }
    })
    .then(data => {

        userData.likes = [];
        //iterate thru the data
        data.forEach(doc => {
            userData.likes.push(doc.data());
        });
        return db.collection('notifications').where('recipient', '==', req.user.handle)
        .orderBy('createdAt', 'desc').limit(10).get();
    })
    .then((data)=> {
        userData.notifications = [];
        data.forEach(doc => {
            userData.notifications.push({
                recipient: doc.data().recipient,
                sender: doc.data().sender,
                createdAt: doc.data().createdAt,
                screamId: doc.data().screamId,
                type: doc.data().type,
                read: doc.data().read,
                notificationId: doc.id
            })
        });
        return res.json(userData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    })
}

//npm install busboy to help with image handling 
exports.uploadImage = (req, res) => {

    const busBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    //takes an options object with a headers item
    const busboy = new busBoy({ headers: req.headers });

    //declare vars that need global scope here 
    let imageFileName;
    let imageToBeUploaded = {};

    //on-file event 
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        
        //check for filetype
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Invalid file-type!' });
        }

        //get img file extension
        //split the filename on the '.'
        //when the filename is split, the elements will be stored in an array
        //we need to access the last element of the array to access the filetype extension
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //rename image file using a randomly generated string of numbers
        //concatenate the filename and file extension
        const imageFileName = `${Math.round(Math.random() * 1000000000000)}.${imageExtension}`;
        //filepath (tmpdir = temp directory)
        const filepath = path.join(os.tmpdir(), imageFileName);
        //create 2 properties within the imageToBeUploaded object
        imageToBeUploaded = { filepath, mimetype };
        //use file sys library to actually create the file
        //file.pipe= a node.js method
        file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on('finish', () => {
        //upload file that has just been created
        admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            //construct the img url 
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
            //add the img url to user's document 
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(() => {
            return res.json({ message : 'Image uploaded successfully!'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code });
        });
    });
    busboy.end(req.rawBody);
}

//mark notification as read
//send to server an array of ids of notifications the user has just seen 
//these will be marked as read on the server and then client side 
exports.markNotificationsRead = (req, res) => {

    //need to perform a batch write
    //this is when you need to write/update multiple firebase documents
    let batch = db.batch();
    //body is an array of ids
    req.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`);
        //mark as true as the user has just read the notification
        batch.update(notification, { read: true });
    });
    batch.commit()
    .then(() => {
        return res.json({ message: 'Notifications marked read' });
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    });
};