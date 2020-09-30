const {db} = require('../util/admin');

//get all screams
exports.getAllScreams = (req, res) => {

    db.collection('screams').orderBy('createdAt', 'desc').get()
    .then(data => {
        //query snapshot
        //store fetched screams in array 
        let screams = [];
        data.forEach(doc => {
            //doc.data is the function that returns data inside the document
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
                commentCount: doc.data().commentCount,
                likeCount: doc.data().likeCount,
                userImage: doc.data().userImage
            });
        });
        //now return the data
        //return as json object
        return res.json(screams);
    })
    //returns a promise
    //good practice to catch any errors 
    .catch(err => console.error(err));

}

//post one scream
exports.postOneScream = (req, res) => {
    //create a new body for the post request 
    //initialize scream
    const newScream = {
        body : req.body.body,
        userHandle : req.body.user.handle,
        userImage: req.user.imageUrl,
        createdAt : new Date().toISOString(),
        likeCount: 0,
        commentCount: 0

    };
    //persistent data = data that is not temporary
    //persist the new object in the database
    //.add takes a json object to add to the db
    db.collection('screams').add(newScream)
    //returns a promise
    .then((doc) => {
        //return the scream
        const resScream = newScream;
        resScream.screamId = doc.id;
        res.json(resScream);
    })
    .catch((err) => {
        res.status(500).json( { error: 'something went wrong!'});
        console.error(err);
    });
}

//get scream
exports.getScream = (req, res) => {
    //create screamData object
    let screamData ={};
    //get the scream
    db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      screamData = doc.data();
        //assign the scream id to screamId, to help match comments
        screamData.screamId = doc.id;
        //fetch scream comments 
        return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
         
    })
    
    .then((data) => {
        //query snapshot
        //create array within screamData object to store comments
        screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

//Comment on a comment
exports.commentOnScream = (req, res) => {

    //validate body
    if(req.body.body.trim() === '') return res.status(400).json({ comment: 'Empty field!'});

    //create comment object to persist to database
    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    //validate whether scream exists
    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({ error: 'Scream nor found!'});
        }
        //update comment count
        return doc.ref.update({ commentCount: doc.data().commentCount +1});
    })
    .then(() => {
        //.add() is the function used to add to a document- passes a json object
        return db.collection('comments').add(newComment);
    })
    .then(() => {
        //doucment created successfully
        //return comment to user
        res.json(newComment);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong!' });
    })
}

exports.likeScream = (req, res) => {
    //Efficient to spread properties, eg store scream likes in a seperate collection from the scream 

    //check if the user has already liked the scream
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId).limit(1);
    //check if the scream exists
    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDocument.get()
    .then(doc => {
        if(doc.exists) {
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDocument.get();
        } else {
            return res.status(404).json({ error: 'Scream not found '});
        }
    })
    //query snapshot
    .then(data => {
        //if the array is empty- there is no existing like and it can be created/added
        if(data.empty) {
            return db.collection('likes').add({
                screamId: req.params.screamId,
                userHandle: req.user.handle
            })
            .then(() => {
                //increment like count
                screamData.likeCount++;
                //increment the like property in document of the scream in the db 
                return screamDocument.update({likeCount: screamData.likeCount });
            })
            .then(() => {
                //on success
                //returns write result
                return res.json(screamData);
            })
        } else {
            return res.status(400).json({ error: 'You already like this!'});
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.code });
    });
};

exports.unlikeScream = (req, res) => {

    //check if the user has already liked the scream
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId).limit(1);
    //check if the scream exists
    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDocument.get()
    .then(doc => {
        if(doc.exists) {
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDocument.get();
        } else {
            return res.status(404).json({ error: 'Scream not found '});
        }
    })
    //query snapshot
    .then(data => {
        //if the array is empty- there is no existing like and it can be created/added
        if(data.empty) {
            return res.status(400).json({ error: 'You have not liked this anyway!'});
        } else {
            //return document path to delete from likes collection
            return db.doc(`/likes/${data.docs[0].id}`).delete()
            .then(() => {
                //decrement like count under relevant scream inside screams collection
                screamData.likeCount --;
                return screamDocument.update({ likeCount: screamData.likeCount });
            })
            .then(() => {
                //return scream data
                res.json(screamData);
            })
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.code });
    });
}

exports.deleteScream = (req, res) => {

    const document = db.doc(`/screams/${req.params.screamId}`);
    document.get()
    //check that doc exists
    .then(doc => {
        if(!doc.exists) {
            return res.status(404).json({ error: 'Scream not found'});
        }
        //check that current  userId matches the id of the author of the scream they wishto delete 
        if(doc.data().userHandle !== req.user.handle){
            return res.status(403).json({ error: 'Unauthorized' });
        } else {
            return document.delete();
        }
    })
    .then(() => {
        res.json({ message: 'Scream deleted!' });
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    })

}