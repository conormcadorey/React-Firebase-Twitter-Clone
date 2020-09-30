const { admin, db } = require('./admin');

//user auth middlewear
//this middlewear will authenticate the user before allowing db posts/reads etc 
module.exports = (req, res, next) => {
    //init id token 
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {//if these exist
        //split token into two parts 
        //'Bearer' and the actual token 
        //store the actual token in the new arrays index of 1
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized!'});
    }

    //verify token was issued from this application 
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        //decoded token holds the user data inside of the token
        //this data needs to be added to the req object 
        req.user = decodedToken;
        //next retrieve the user handle 
        //this is stored in the main firebase db and not within auth 
        //so a db query is needed
        return db.collection('users').where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    //data is returned
    .then(data => {
        //take first element from data array
        //data() funtion extracts the data from the document
        req.user.handle = data.docs[0].data().handle;
        req.user.imageUrl = data.docs[0].data().imageUrl;
        //allow the req to proceed
        return next();
    })
    .catch(err => {
        console.error('Error while verifying token', err);
        return res.status(403).json(err);
    })
}