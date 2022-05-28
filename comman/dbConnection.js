const sql = require('mysql');
require('dotenv').config()
const database = sql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	options: {
		encrypt: true
	}
});

database.connect(function (err) {
	if (err) console.log('DB not connected');;
});

module.exports.executeQuery = function (query, params = []) {
	return new Promise((resolve, reject) => {
		database.query(query, params, function (error, results3) {
			if (error) reject(error);
			resolve(results3);
		})
	})
};