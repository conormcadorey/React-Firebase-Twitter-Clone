//helper functions
const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

exports.validateSignupData = (data) => {

    //initialise errors object 
    let errors = {};

    if(isEmpty(data.email)) {
        errors.email = 'Email must not be empty!'
    } else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email address!'
    }

    if(isEmpty(data.password)) {
        errors.password = 'Please enter a password!'
    }

    if (data.password != data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match!'
    }

    if (isEmpty(data.handle)) {
        errors.handle = 'Please enter a user handle!'
    }

    //check if errors array is not empty 
    //return object that contains a property called 'valid'
    return {
        errors,
        //if there are no error keys- true and the data is valid, else false and the data is not valid
        valid: Object.keys(errors).length === 0 ? true : false
    }    
}

exports.validateLoginData = (data) => {

    //error validation
    let errors = {};

    if(isEmpty(data.email)) {
        errors.email = 'Please enter an email address!';
    }

    if(isEmpty(data.password)) {
        errors.password = 'Please enter a password!';
    }

    return {
        errors,
        //if there are no error keys- true and the data is valid, else false and the data is not valid
        valid: Object.keys(errors).length === 0 ? true : false
    }    
}

exports.reduceUserDetails = (data) => {

    let userDetails = {};

    //check if bio is empty
    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;

    //check if website is empty
    //check if users website url includes 'http'
    //if not, append 'http' to their website url
    if(!isEmpty(data.website.trim())) {
        //substring takes a substring from a string- assign a start and an end 
        if(data.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        } else {
            userDetails.website = data.website;
        }
    } 

    //check if location is empty
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;
    return userDetails;
}