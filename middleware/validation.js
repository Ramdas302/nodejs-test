const { check } = require('express-validator');


user_signupvalidation = 
    [
        check('first_name').isLength({min:3,max:15}).withMessage('first name should be minimum 3 characters and maximum 15 characters.').not().isEmpty().withMessage('first name is require'),
        check('last_name').isLength({min:3,max:15}).withMessage('last name should be minimum 3 characters and maximum 15 characters.').not().isEmpty().withMessage('last name is require'),
        check('middle_name').isLength({min:3,max:15}).withMessage('middle name should be minimum 3 characters and maximum 15 characters.').not().isEmpty().withMessage('middle name is require'),
        check('mobile_no').not().isEmpty().withMessage('mobile no is require').isLength({min:10, max:10}).withMessage('enter 10 digits'),
        check('email_address').not().isEmpty().withMessage('email is require').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).withMessage('Please include a valid email'),
        check('password').matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,16}$/).withMessage('use at least a number, and at least a special character, one capital character').isLength({ min: 8 }).withMessage(' minimum password length is 8').not().isEmpty().withMessage('password is require')
    ],
     
module.exports={
    user_signupvalidation
    
}