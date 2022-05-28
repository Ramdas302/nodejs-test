const userModel = require('../models/studentModel')
const { user_signupvalidation} = require('../middleware/validation');
const userauthorization = require('../middleware/jwt-verify')
module.exports = function (app) {

	app.post('/api/sign-up',user_signupvalidation, function (req, res) {
		userModel.SignUp(req, res);
	});

	app.post('/api/login', function (req, res) {
		userModel.Login(req, res);
	});

	app.get('/api/get-users',userauthorization, function (req, res) {
		userModel.getUsers(req, res);
	});

	app.post('/api/refresh-access-token', function (req, res) {
		userModel.refreshAccessToken(req, res);
	});

	app.post('/api/submit-student-doc', function (req, res) {
		userModel.submit_student_doc(req, res);
	});

	app.post('/api/get-student-document', function (req, res) {
		userModel.get_student_document(req, res);
	});

	app.post('/api/delete-student-doc', function (req, res) {
		userModel.delete_student_doc(req, res);
	});
	app.get('/api/send-student-data', function (req, res) {
		userModel.send_student_data(req, res);
	});

	
}